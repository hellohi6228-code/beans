import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { Btn, Card, Chip, Divider, Label, Row, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { radius, space, theme } from '../../src/theme';
import { SUPPLIER_LABEL } from '../../src/types';
import { money, priceParts, weightParts } from '../../src/units';

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, me, messagesOf, userById, sendMessage, listingById, setOrderStatus } = useStore();
  const scroller = useRef<ScrollView>(null);
  const [draft, setDraft] = useState('');

  const thread = state.threads.find((t) => t.id === String(id));
  if (!thread || !me) return <Header back title="Conversation not found" />;

  const otherId = thread.customerId === me.id ? thread.supplierId : thread.customerId;
  const other = userById(otherId);
  const messages = messagesOf(thread.id);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    sendMessage(thread.id, text);
    setDraft('');
    requestAnimationFrame(() => scroller.current?.scrollToEnd({ animated: true }));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <Header
        back
        title={other?.name ?? 'Chat'}
        subtitle={
          other?.role === 'supplier' ? SUPPLIER_LABEL[other.supplierType ?? 'bulk'] : 'Buyer'
        }
        right={<Chip label="Profile" onPress={() => router.push(`/business/${otherId}`)} />}
      />

      <ScrollView
        ref={scroller}
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.lg, gap: space.sm }}
        onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: false })}
      >
        <Card style={{ backgroundColor: theme.accentSoft, borderColor: theme.accentSoft, padding: space.md }}>
          <T size={12.5} color={theme.inkSoft}>
            Agree the details here and settle payment between yourselves. The price on the listing is the whole price
            — if you are asked for more, use Report.
          </T>
        </Card>

        {messages.map((m) => {
          if (m.orderId) {
            const order = state.orders.find((o) => o.id === m.orderId);
            if (!order) return null;
            const listing = listingById(order.listingId);
            const price = priceParts(order.lockedPricePerKg);
            const qty = weightParts(order.qtyKg);
            const isCustomer = me.id === order.customerId;

            return (
              <Card key={m.id} style={{ gap: space.sm }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Label>Order enquiry</Label>
                  <Chip
                    label={
                      order.status === 'inquiry'
                        ? 'Awaiting supplier'
                        : order.status === 'agreed'
                          ? 'Agreed'
                          : order.status === 'completed'
                            ? 'Completed'
                            : 'Cancelled'
                    }
                    tone={order.status === 'completed' ? 'good' : order.status === 'cancelled' ? 'warn' : 'neutral'}
                  />
                </Row>

                <T size={16} weight="700">
                  {listing?.title ?? 'Listing'}
                </T>

                <Row style={{ justifyContent: 'space-between' }}>
                  <View>
                    <T size={12} color={theme.muted} weight="600">
                      QUANTITY
                    </T>
                    <T size={14.5} weight="600">
                      {qty.kg} / {qty.lb}
                    </T>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <T size={12} color={theme.muted} weight="600">
                      PRICE
                    </T>
                    <T size={14.5} weight="600">
                      {price.perKg} · {price.perLb}
                    </T>
                  </View>
                </Row>

                <Divider />

                <Row style={{ justifyContent: 'space-between' }}>
                  <View>
                    <T size={15} weight="700">
                      Total to pay
                    </T>
                    <T size={12.5} color={order.shippingIncluded ? theme.good : theme.warn}>
                      {order.shippingIncluded ? 'Shipping included' : 'Shipping not included'}
                    </T>
                  </View>
                  <T size={22} weight="800">
                    {money(order.lockedTotal)}
                  </T>
                </Row>

                {isCustomer ? (
                  <Row style={{ gap: space.sm }}>
                    {order.status === 'completed' && !order.reviewed ? (
                      <Btn
                        title="Write a review"
                        kind="soft"
                        onPress={() => router.push(`/review/${order.id}`)}
                        style={{ flex: 1, height: 42 }}
                      />
                    ) : null}
                    <Btn
                      title="Report price"
                      kind="danger"
                      onPress={() => router.push(`/report/${order.listingId}?orderId=${order.id}`)}
                      style={{ flex: 1, height: 42 }}
                    />
                  </Row>
                ) : (
                  <Row style={{ gap: space.sm }}>
                    {order.status === 'inquiry' ? (
                      <Btn
                        title="Confirm at listed price"
                        onPress={() => setOrderStatus(order.id, 'agreed')}
                        style={{ flex: 1, height: 42 }}
                      />
                    ) : null}
                    {order.status === 'agreed' ? (
                      <Btn
                        title="Mark completed"
                        kind="soft"
                        onPress={() => setOrderStatus(order.id, 'completed')}
                        style={{ flex: 1, height: 42 }}
                      />
                    ) : null}
                  </Row>
                )}
              </Card>
            );
          }

          const mineMsg = m.senderId === me.id;
          return (
            <View
              key={m.id}
              style={{
                alignSelf: mineMsg ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
                backgroundColor: mineMsg ? theme.accent : theme.cardSolid,
                borderRadius: radius.lg,
                borderBottomRightRadius: mineMsg ? 4 : radius.lg,
                borderBottomLeftRadius: mineMsg ? radius.lg : 4,
                paddingHorizontal: space.md,
                paddingVertical: space.sm + 2,
              }}
            >
              <T size={14.5} color={mineMsg ? '#fff' : theme.ink} style={{ lineHeight: 20 }}>
                {m.text}
              </T>
            </View>
          );
        })}
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          gap: space.sm,
          paddingHorizontal: space.lg,
          paddingTop: space.sm,
          paddingBottom: insets.bottom + space.sm,
          borderTopWidth: 1,
          borderTopColor: theme.line,
          backgroundColor: 'rgba(255,255,255,0.9)',
        }}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Message"
          placeholderTextColor={theme.muted}
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 46,
            maxHeight: 110,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: theme.line,
            backgroundColor: theme.cardSolid,
            paddingHorizontal: space.md,
            paddingTop: 12,
            fontSize: 15,
            color: theme.ink,
          }}
          multiline
        />
        <Btn title="Send" onPress={send} disabled={!draft.trim()} style={{ height: 46, paddingHorizontal: space.lg }} />
      </View>
    </KeyboardAvoidingView>
  );
}
