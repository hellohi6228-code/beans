import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Header } from '../../src/components/Header';
import { PhotoPicker } from '../../src/components/PhotoPicker';
import { Btn, Card, Chip, Divider, Field, Label, Row, Sub, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { space, theme } from '../../src/theme';
import { money, priceParts } from '../../src/units';

const REASONS = ['Asked for more', 'Charged shipping anyway', 'Added a fee', 'Added tax', 'Something else'];

export default function ReportPrice() {
  const { postId, orderId } = useLocalSearchParams<{ postId: string; orderId?: string }>();
  const router = useRouter();
  const { postById, userById, state, addReport } = useStore();

  const post = postById(String(postId));
  const seller = post ? userById(post.userId) : undefined;
  const order = orderId ? state.orders.find((o) => o.id === String(orderId)) : undefined;
  const listing = post?.listing;

  const listedTotal = order ? order.lockedTotal : listing ? listing.pricePerKg * listing.lotKg : 0;

  const [asked, setAsked] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  if (!post || !seller || !listing) return <Header back title="Not found" />;

  const askedNum = parseFloat(asked.replace(/[^0-9.]/g, ''));
  const valid = isFinite(askedNum) && askedNum >= 0;
  const diff = valid ? askedNum - listedTotal : 0;
  const ready = valid && Math.abs(diff) > 0.0001 && details.trim().length > 4;

  const submit = () => {
    addReport({
      postId: post.id,
      orderId: order?.id,
      supplierId: seller.id,
      listedTotal,
      askedTotal: askedNum,
      reason,
      details: details.trim(),
      photos,
    });
    setSent(true);
  };

  if (sent) {
    return (
      <>
        <Header title="Report filed" />
        <ScrollView contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: space.md }}>
          <Card style={{ alignItems: 'center', gap: space.sm, paddingVertical: space.xl }}>
            <T size={40}>🛡️</T>
            <T size={19} weight="700">
              Report filed
            </T>
            <Sub>{seller.name} has been notified.</Sub>
          </Card>
          <Btn title="Done" onPress={() => router.back()} />
        </ScrollView>
      </>
    );
  }

  const price = priceParts(listing.pricePerKg);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header back title="Report price" subtitle={seller.name} />

      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: space.md, paddingBottom: space.xxl }}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={{ gap: space.sm }}>
          <T size={15} weight="700" numberOfLines={2}>
            {post.caption || 'Post'}
          </T>
          <T size={12.5} color={theme.muted}>
            {price.perKg} · {price.perLb}
          </T>
          <Chip
            label={listing.shippingIncluded ? 'Shipping included' : 'Shipping not included'}
            tone={listing.shippingIncluded ? 'good' : 'warn'}
          />

          <Divider />

          <Row style={{ justifyContent: 'space-between' }}>
            <T size={14} weight="600">
              Listed total
            </T>
            <T size={17} weight="800">
              {money(listedTotal)}
            </T>
          </Row>
        </Card>

        <Card style={{ gap: space.lg }}>
          <Field
            label="What they asked for"
            value={asked}
            onChangeText={setAsked}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />

          {valid && Math.abs(diff) > 0.0001 ? (
            <Card
              style={{
                backgroundColor: diff > 0 ? theme.warnSoft : theme.goodSoft,
                borderColor: diff > 0 ? theme.warnSoft : theme.goodSoft,
                padding: space.md,
              }}
            >
              <T size={14} weight="700" color={diff > 0 ? theme.warn : theme.good}>
                {diff > 0 ? `${money(diff)} more than listed` : `${money(-diff)} less than listed`}
              </T>
            </Card>
          ) : null}

          <View style={{ gap: space.sm }}>
            <Label>What happened</Label>
            <View style={{ gap: 6 }}>
              {REASONS.map((r) => (
                <Chip key={r} label={r} selected={r === reason} onPress={() => setReason(r)} />
              ))}
            </View>
          </View>

          <Field label="Details" value={details} onChangeText={setDetails} multiline placeholder="What happened?" />

          <PhotoPicker photos={photos} onChange={setPhotos} max={3} label="Screenshots" />
        </Card>

        <Card style={{ backgroundColor: theme.warnSoft, borderColor: theme.warnSoft, padding: space.md }}>
          <T size={12.5} color={theme.inkSoft}>
            The listed price is the final price. Any difference counts.
          </T>
        </Card>

        <Btn title="File report" kind="danger" onPress={submit} disabled={!ready} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
