import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../src/components/Header';
import { ListingCard } from '../src/components/ListingCard';
import { Avatar, Card, Chip, Empty, Label, Row, Sub, T } from '../src/components/ui';
import { useStore } from '../src/store';
import { space, theme } from '../src/theme';
import { SUPPLIER_LABEL } from '../src/types';
import { weightParts } from '../src/units';

export default function Results() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, userById, ratingOf, me } = useStore();
  const req = state.request;

  const { covers, smaller } = useMemo(() => {
    const qtyKg = req?.qtyKg ?? 0;
    // Anyone can buy from anyone — you just cannot buy from yourself.
    let pool = state.listings.filter((l) => l.active && l.supplierId !== me?.id);
    if (req?.shippingIncluded) pool = pool.filter((l) => l.shippingIncluded);

    const byTotal = (a: typeof pool[number], b: typeof pool[number]) =>
      a.pricePerKg * Math.min(qtyKg, a.lotKg) - b.pricePerKg * Math.min(qtyKg, b.lotKg);

    return {
      covers: pool.filter((l) => l.lotKg >= qtyKg).sort(byTotal),
      smaller: pool.filter((l) => l.lotKg < qtyKg).sort((a, b) => a.pricePerKg - b.pricePerKg),
    };
  }, [state.listings, req, me]);

  const suppliers = state.users.filter((u) => u.role === 'supplier' && u.id !== me?.id);

  if (!req) {
    return (
      <>
        <Header back title="Results" />
        <Empty glyph="🔍" title="No amount set" />
      </>
    );
  }

  const w = weightParts(req.qtyKg);

  return (
    <>
      <Header
        back
        title={`${w.kg} / ${w.lb}`}
        subtitle={req.shippingIncluded ? 'Shipping included' : 'Shipping separate'}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + space.xxl, gap: space.md }}
      >
        <Label>Enough for you</Label>

        {covers.length === 0 ? (
          <Card>
            <Empty glyph="📭" title="Nothing this big" body="Try a smaller amount." />
          </Card>
        ) : (
          covers.map((l) => (
            <ListingCard key={l.id} listing={l} supplier={userById(l.supplierId)} qtyKg={req.qtyKg} />
          ))
        )}

        {smaller.length ? (
          <>
            <Label>Smaller lots</Label>
            {smaller.map((l) => (
              <ListingCard key={l.id} listing={l} supplier={userById(l.supplierId)} />
            ))}
          </>
        ) : null}

        <Label>Suppliers</Label>

        {suppliers.map((s) => {
          const r = ratingOf(s.id);
          return (
            <Card key={s.id} onPress={() => router.push(`/business/${s.id}`)} style={{ padding: space.md }}>
              <Row style={{ gap: space.md }}>
                <Avatar uri={s.avatar} name={s.name} />
                <View style={{ flex: 1 }}>
                  <T size={15} weight="600">
                    {s.name}
                  </T>
                  <T size={12.5} color={theme.muted}>
                    {SUPPLIER_LABEL[s.supplierType ?? 'bulk']} · {s.location}
                  </T>
                </View>
                {r.count ? <Chip label={`★ ${r.avg.toFixed(1)}`} tone="gold" /> : null}
              </Row>
            </Card>
          );
        })}
      </ScrollView>
    </>
  );
}
