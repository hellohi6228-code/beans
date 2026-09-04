import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { Avatar, Btn, Card, Chip, Divider, Field, Label, Photo, Row, Segmented, Stars, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { space, theme } from '../../src/theme';
import { SUPPLIER_LABEL } from '../../src/types';
import { Unit, money, priceParts, toKg, weightParts } from '../../src/units';

const W = Dimensions.get('window').width;

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { listingById, userById, ratingOf, startOrder, me, state } = useStore();

  const listing = listingById(String(id));
  const supplier = listing ? userById(listing.supplierId) : undefined;

  const [unit, setUnit] = useState<Unit>(state.request?.unit ?? 'kg');
  const [qty, setQty] = useState(() => {
    if (!listing) return '';
    const kg = Math.min(state.request?.qtyKg ?? listing.lotKg, listing.lotKg);
    const u = state.request?.unit ?? 'kg';
    return String(Number((u === 'kg' ? kg : kg * 2.20462262).toFixed(2)));
  });

  if (!listing || !supplier) return <Header back title="Not found" />;

  const price = priceParts(listing.pricePerKg);
  const lot = weightParts(listing.lotKg);
  const rating = ratingOf(supplier.id);

  const parsed = parseFloat(qty.replace(',', '.'));
  const qtyKg = isFinite(parsed) && parsed > 0 ? toKg(parsed, unit) : 0;
  const overLot = qtyKg > listing.lotKg + 1e-9;
  const isMine = me?.id === listing.supplierId;
  const canOrder = !!me && !isMine && qtyKg > 0 && !overLot;

  const order = () => {
    const { threadId } = startOrder(listing.id, qtyKg);
    router.replace(`/chat/${threadId}`);
  };

  return (
    <>
      <Header back title={listing.title} subtitle={supplier.name} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 120, gap: space.md }}
      >
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -space.lg }}
        >
          <View style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg }}>
            {listing.photos.map((uri, i) => (
              <Photo key={i} uri={uri} style={{ width: W - space.lg * 2, height: 230 }} />
            ))}
          </View>
        </ScrollView>

        <Card style={{ gap: space.sm }}>
          <T size={20} weight="700">
            {listing.title}
          </T>

          <Chip
            label={listing.shippingIncluded ? 'Shipping included' : 'Shipping not included'}
            tone={listing.shippingIncluded ? 'good' : 'warn'}
          />

          <Divider />

          <Row style={{ justifyContent: 'space-between' }}>
            <View>
              <Label>Price</Label>
              <T size={22} weight="800" color={theme.accent}>
                {price.perKg}
              </T>
              <T size={15} weight="600" color={theme.inkSoft}>
                {price.perLb}
              </T>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Label>Amount</Label>
              <T size={22} weight="800">
                {lot.kg}
              </T>
              <T size={15} weight="600" color={theme.inkSoft}>
                {lot.lb}
              </T>
            </View>
          </Row>
        </Card>

        <Card onPress={() => router.push(`/business/${supplier.id}`)} style={{ padding: space.md }}>
          <Row style={{ gap: space.md }}>
            <Avatar uri={supplier.avatar} name={supplier.name || '?'} />
            <View style={{ flex: 1 }}>
              <T size={15} weight="700">
                {supplier.name}
              </T>
              {supplier.supplierType ? (
                <T size={12.5} color={theme.muted}>
                  {SUPPLIER_LABEL[supplier.supplierType]}
                </T>
              ) : null}
              {rating.count ? <Stars value={rating.avg} /> : null}
            </View>
            <T size={18} color={theme.muted}>
              ›
            </T>
          </Row>
        </Card>

        {me && !isMine ? (
          <Card style={{ gap: space.md }}>
            <Label>How much</Label>
            <Row style={{ gap: space.sm, alignItems: 'flex-end' }}>
              <Field value={qty} onChangeText={setQty} keyboardType="decimal-pad" style={{ flex: 1 }} />
              <View style={{ width: 120 }}>
                <Segmented
                  value={unit}
                  onChange={setUnit}
                  options={[
                    { value: 'kg', label: 'kg' },
                    { value: 'lb', label: 'lb' },
                  ]}
                />
              </View>
            </Row>

            <T size={13} color={overLot ? theme.warn : theme.muted}>
              {overLot
                ? `Only ${lot.kg} / ${lot.lb} available.`
                : qtyKg > 0
                  ? `${weightParts(qtyKg).kg} / ${weightParts(qtyKg).lb}`
                  : ''}
            </T>

            <Divider />

            <Row style={{ justifyContent: 'space-between' }}>
              <Label>Total</Label>
              <T size={26} weight="800">
                {money(listing.pricePerKg * qtyKg)}
              </T>
            </Row>

            <Btn title="Order" onPress={order} disabled={!canOrder} />
          </Card>
        ) : null}

        <Btn title="Report price" kind="danger" onPress={() => router.push(`/report/${listing.id}`)} />
      </ScrollView>
    </>
  );
}
