import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Header } from '../../src/components/Header';
import { PhotoPicker } from '../../src/components/PhotoPicker';
import { Btn, Card, Chip, Divider, Field, Label, Row, Sub, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { space, theme } from '../../src/theme';
import { money, priceParts, weightParts } from '../../src/units';

const REASONS = [
  'Asked for more than the listed price',
  'Charged shipping although the listing includes it',
  'Added a processing or banking fee',
  'Added tax on top of the listed price',
  'Something else',
];

export default function ReportPrice() {
  const { listingId, orderId } = useLocalSearchParams<{ listingId: string; orderId?: string }>();
  const router = useRouter();
  const { listingById, userById, state, addReport } = useStore();

  const listing = listingById(String(listingId));
  const supplier = listing ? userById(listing.supplierId) : undefined;
  const order = orderId ? state.orders.find((o) => o.id === String(orderId)) : undefined;

  const listedTotal = order ? order.lockedTotal : listing ? listing.pricePerKg * listing.lotKg : 0;

  const [asked, setAsked] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  if (!listing || !supplier) return <Header back title="Listing not found" />;

  const askedNum = parseFloat(asked.replace(/[^0-9.]/g, ''));
  const valid = isFinite(askedNum) && askedNum >= 0;
  const diff = valid ? askedNum - listedTotal : 0;
  const ready = valid && Math.abs(diff) > 0.0001 && details.trim().length > 4;

  const submit = () => {
    addReport({
      listingId: listing.id,
      orderId: order?.id,
      supplierId: supplier.id,
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
              Thanks — we have it
            </T>
            <Sub>
              {supplier.name} has been notified. Beans runs a zero-tolerance policy: the listed price is the whole
              price, including processing, banking and tax.
            </Sub>
          </Card>

          <Card style={{ gap: space.xs }}>
            <Label>What happens next</Label>
            <Sub>
              The report sits against this listing while it is reviewed. What a supplier charges on their own website
              or in their own shop is their business — inside Beans, the listed number is the deal.
            </Sub>
          </Card>

          <Btn title="Done" onPress={() => router.back()} />
        </ScrollView>
      </>
    );
  }

  const price = priceParts(listing.pricePerKg);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header back title="Report a price discrepancy" subtitle={supplier.name} />

      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: space.md, paddingBottom: space.xxl }}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={{ gap: space.sm }}>
          <T size={15.5} weight="700">
            {listing.title}
          </T>
          <T size={12.5} color={theme.muted}>
            {price.perKg} · {price.perLb}
            {order ? ` · ${weightParts(order.qtyKg).kg} / ${weightParts(order.qtyKg).lb}` : ''}
          </T>
          <Row style={{ gap: 6 }}>
            <Chip
              label={listing.shippingIncluded ? 'Shipping included' : 'Shipping not included'}
              tone={listing.shippingIncluded ? 'good' : 'warn'}
            />
          </Row>

          <Divider />

          <Row style={{ justifyContent: 'space-between' }}>
            <T size={14} weight="600">
              Listed total {order ? 'for your order' : 'for the whole lot'}
            </T>
            <T size={17} weight="800">
              {money(listedTotal)}
            </T>
          </Row>
        </Card>

        <Card style={{ gap: space.lg }}>
          <Field
            label="What were you actually asked to pay"
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
              <T size={12.5} color={theme.inkSoft} style={{ marginTop: 2 }}>
                Tolerance on Beans is zero. Any difference at all is worth reporting.
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

          <Field
            label="Details"
            value={details}
            onChangeText={setDetails}
            multiline
            placeholder="What were you told, and when?"
          />

          <PhotoPicker
            photos={photos}
            onChange={setPhotos}
            max={3}
            label="Evidence"
            hint="Screenshots of the invoice or the message, if you have them."
          />
        </Card>

        <Card style={{ backgroundColor: theme.warnSoft, borderColor: theme.warnSoft, padding: space.md, gap: 4 }}>
          <T size={13} weight="700" color={theme.warn}>
            The rule, in full
          </T>
          <T size={12.5} color={theme.inkSoft} style={{ lineHeight: 18 }}>
            A listing price on Beans covers everything — processing, banking and tax. Shipping is included only when
            the listing says so, and the supplier sets that themselves. We cannot control what a supplier charges
            elsewhere, but on this platform the listed number is the price.
          </T>
        </Card>

        <Btn title="File report" kind="danger" onPress={submit} disabled={!ready} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
