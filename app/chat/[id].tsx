import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { Btn, Card, Chip, Divider, Label, Photo, Row, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { radius, space, theme } from '../../src/theme';
import { SUPPLIER_LABEL } from '../../src/types';
import { money, priceParts, weightParts } from '../../src/units';

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, me, messagesOf, userById, postById, sendMessage } = useStore();
  const scroller = useRef<ScrollView>(null);
  const [draft, setDraft] = useState('');

  const thread = state.threads.find((t) => t.id === String(id));
  if (!thread || !me) return <Header back title="Not found" />;

  const otherId = thread.participants.find((p) => p !== me.id) ?? thread.participants[0];
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header
        back
        title={other?.name || 'Chat'}
        subtitle={other?.supplierType ? SUPPLIER_LABEL[other.supplierType] : undefined}
        right={<Chip label="Profile" onPress={() => router.push(`/business/${otherId}`)} />}
      />

      <ScrollView
        ref={scroller}
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.lg, gap: space.sm }}
        onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: false })}
      >
        {messages.map((m) => {
          if (m.postId) {
            const post = postById(m.postId);
            if (!post) return null;
            return (
              <Card
                key={m.id}
                onPress={() => router.push(`/post/${post.id}`)}
                style={{ padding: space.md, gap: space.sm }}
              >
                <Row style={{ gap: space.md, alignItems: 'flex-start' }}>
                  <Photo uri={post.photos[0]} style={{ width: 64, height: 64 }} radius={10} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <T size={13.5} numberOfLines={2} style={{ lineHeight: 18 }}>
                      {post.caption || 'Post'}
                    </T>

                    {/* If it is selling coffee, the price comes with it. */}
                    {post.listing ? (
                      <>
                        <Row style={{ gap: 6 }}>
                          <T size={14} weight="700" color={theme.accent}>
                            {priceParts(post.listing.pricePerKg).perKg}
                          </T>
                          <T size={12.5} color={theme.inkSoft}>
                            · {priceParts(post.listing.pricePerKg).perLb}
                          </T>
                        </Row>
                        <T size={12} color={theme.muted}>
                          {weightParts(post.listing.lotKg).kg} / {weightParts(post.listing.lotKg).lb}
                        </T>
                        <Chip
                          label={post.listing.shippingIncluded ? 'Shipping included' : 'Shipping not included'}
                          tone={post.listing.shippingIncluded ? 'good' : 'warn'}
                        />
                      </>
                    ) : null}
                  </View>
                </Row>
              </Card>
            );
          }

          if (m.orderId) {
            const order = state.orders.find((o) => o.id === m.orderId);
            if (!order) return null;
            const post = postById(order.postId);
            const price = priceParts(order.lockedPricePerKg);
            const qty = weightParts(order.qtyKg);
            const isBuyer = me.id === order.customerId;

            return (
              <Card key={m.id} style={{ gap: space.sm }}>
                <Label>Order</Label>

                <Row style={{ gap: space.md }}>
                  <Photo uri={post?.photos[0]} style={{ width: 52, height: 52 }} radius={10} />
                  <View style={{ flex: 1 }}>
                    <T size={14} numberOfLines={2}>
                      {post?.caption || 'Post'}
                    </T>
                  </View>
                </Row>

                <Row style={{ justifyContent: 'space-between' }}>
                  <View>
                    <Label>Amount</Label>
                    <T size={14.5} weight="600">
                      {qty.kg} / {qty.lb}
                    </T>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Label>Price</Label>
                    <T size={14.5} weight="600">
                      {price.perKg} · {price.perLb}
                    </T>
                  </View>
                </Row>

                <Divider />

                <Row style={{ justifyContent: 'space-between' }}>
                  <View>
                    <T size={15} weight="700">
                      Total
                    </T>
                    <T size={12.5} color={order.shippingIncluded ? theme.good : theme.warn}>
                      {order.shippingIncluded ? 'Shipping included' : 'Shipping not included'}
                    </T>
                  </View>
                  <T size={22} weight="800">
                    {money(order.lockedTotal)}
                  </T>
                </Row>

                {isBuyer ? (
                  <Row style={{ gap: space.sm }}>
                    {!order.reviewed ? (
                      <Btn
                        title="Review"
                        kind="soft"
                        onPress={() => router.push(`/review/${order.id}`)}
                        style={{ flex: 1, height: 42 }}
                      />
                    ) : null}
                    <Btn
                      title="Report price"
                      kind="danger"
                      onPress={() => router.push(`/report/${order.postId}?orderId=${order.id}`)}
                      style={{ flex: 1, height: 42 }}
                    />
                  </Row>
                ) : null}
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
          multiline
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
        />
        <Btn title="Send" onPress={send} disabled={!draft.trim()} style={{ height: 46, paddingHorizontal: space.lg }} />
      </View>
    </KeyboardAvoidingView>
  );
}
