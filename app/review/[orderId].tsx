import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Header } from '../../src/components/Header';
import { PhotoPicker } from '../../src/components/PhotoPicker';
import { Btn, Card, Field, Label, Row, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { space, theme } from '../../src/theme';
import { money, weightParts } from '../../src/units';

export default function WriteReview() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const { state, me, postById, userById, addReview } = useStore();

  const order = state.orders.find((o) => o.id === String(orderId));
  const post = order ? postById(order.postId) : undefined;
  const supplier = order ? userById(order.supplierId) : undefined;

  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  if (!order || !supplier || !me) return <Header back title="Not found" />;

  const submit = () => {
    addReview({
      orderId: order.id,
      postId: order.postId,
      supplierId: order.supplierId,
      rating,
      text: text.trim(),
      photos,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header back title="Review" subtitle={supplier.name} />

      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: space.md, paddingBottom: space.xxl }}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={{ padding: space.md, gap: 2 }}>
          <T size={15} weight="700" numberOfLines={2}>
            {post?.caption || 'Post'}
          </T>
          <T size={12.5} color={theme.muted}>
            {weightParts(order.qtyKg).kg} / {weightParts(order.qtyKg).lb} · {money(order.lockedTotal)}
          </T>
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

          <Field label="How was it?" value={text} onChangeText={setText} multiline />

          <PhotoPicker photos={photos} onChange={setPhotos} max={3} label="Photos" />
        </Card>

        <Btn title="Post" onPress={submit} disabled={text.trim().length < 3} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
