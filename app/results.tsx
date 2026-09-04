import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../src/components/Header';
import { ListingCard } from '../src/components/ListingCard';
import { Card, Empty } from '../src/components/ui';
import { useStore } from '../src/store';
import { space } from '../src/theme';
import { weightParts } from '../src/units';

export default function Results() {
  const insets = useSafeAreaInsets();
  const { state, userById, me } = useStore();
  const req = state.request;

  const matches = useMemo(() => {
    const qtyKg = req?.qtyKg ?? 0;
    let pool = state.listings.filter((l) => l.active && l.supplierId !== me?.id);
    if (req?.shippingIncluded) pool = pool.filter((l) => l.shippingIncluded);
    return pool
      .filter((l) => l.lotKg >= qtyKg)
      .sort((a, b) => a.pricePerKg * qtyKg - b.pricePerKg * qtyKg);
  }, [state.listings, req, me]);

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
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 120, gap: space.md }}
      >
        {matches.length === 0 ? (
          <Card>
            <Empty glyph="📭" title="Nothing yet" />
          </Card>
        ) : (
          matches.map((l) => (
            <ListingCard key={l.id} listing={l} supplier={userById(l.supplierId)} qtyKg={req.qtyKg} />
          ))
        )}
      </ScrollView>
    </>
  );
}
