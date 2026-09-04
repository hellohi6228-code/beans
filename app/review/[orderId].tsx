import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Header } from '../../src/components/Header';
import { PhotoPicker } from '../../src/components/PhotoPicker';
import { Btn, Card, Chip, Field, Label, Row, Sub, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { space, theme } from '../../src/theme';
import { money, weightParts } from '../../src/units';

export default function WriteReview() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const { state, me, listingById, userById, addReview, badgesFor } = useStore();

  const order = state.orders.find((o) => o.id === String(orderId));
  const listing = order ? listingById(order.listingId) : undefined;
  const supplier = order ? userById(order.supplierId) : undefined;

  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [before, setBefore] = useState<string[]>([]);

  const earnedNow = useMemo(
    () => (me ? badgesFor(me.id).filter((b) => b.earned) : []),
    [me, badgesFor]
  );
  const fresh = earnedNow.filter((b) => !before.includes(b.badge.id));

  if (!order || !listing || !supplier || !me) return <Header back title="Order not found" />;

  const submit = () => {
    setBefore(badgesFor(me.id).filter((b) => b.earned).map((b) => b.badge.id));
    addReview({
      orderId: order.id,
      listingId: order.listingId,
      supplierId: order.supplierId,
      rating,
      text: text.trim(),
      photos,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <>
        <Header title="Review posted" />
        <ScrollView contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: space.md }}>
          <Card style={{ alignItems: 'center', gap: space.sm, paddingVertical: space.xl }}>
            <T size={40}>🎉</T>
            <T size={19} weight="700">
              Review posted
            </T>

          </Card>

          {fresh.length ? (
            <Card style={{ backgroundColor: theme.goldSoft, borderColor: '#EBD9AF', gap: space.sm }}>
              <Label>Unlocked</Label>
              {fresh.map((b) => (
                <Row key={b.badge.id} style={{ gap: space.md }}>
                  <T size={28}>{b.badge.glyph}</T>
                  <View style={{ flex: 1 }}>
                    <T size={15.5} weight="700">
                      {b.badge.name}
                    </T>
                    <T size={12.5} color={theme.inkSoft}>
                      {b.badge.blurb}
                    </T>
                  </View>
                </Row>
              ))}
            </Card>
          ) : null}

          <Btn title="My profile" onPress={() => router.replace('/profile')} />
          <Btn title="Done" kind="ghost" onPress={() => router.replace('/home')} />
        </ScrollView>
      </>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header back title="Review" subtitle={supplier.name} />

      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: space.md, paddingBottom: space.xxl }}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={{ padding: space.md, gap: 4 }}>
          <T size={15.5} weight="700">
            {listing.title}
          </T>
          <T size={12.5} color={theme.muted}>
            {weightParts(order.qtyKg).kg} / {weightParts(order.qtyKg).lb} · {money(order.lockedTotal)}
          </T>
          <Row style={{ gap: 6, marginTop: 4 }}>
            <Chip
              label={order.shippingIncluded ? 'Shipping included' : 'Shipping separate'}
              tone={order.shippingIncluded ? 'good' : 'warn'}
            />
          </Row>
        </Card>

        <Card style={{ gap: space.lg }}>
          <View style={{ gap: space.sm }}>
            <Label>Rating</Label>
            <Row style={{ gap: space.xs }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} onPress={() => setRating(n)} hitSlop={6}>
                  <T size={34} color={n <= rating ? theme.gold : theme.line}>
                    ★
                  </T>
                </Pressable>
              ))}
            </Row>
          </View>

          <Field
            label="How was it?"
            value={text}
            onChangeText={setText}
            multiline
            placeholder="Was it as described?"
          />

          <PhotoPicker photos={photos} onChange={setPhotos} max={3} label="Photos" />
        </Card>

        <Btn title="Post" onPress={submit} disabled={text.trim().length < 3} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
