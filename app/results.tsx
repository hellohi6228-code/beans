import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../src/components/Header';
import { Card, Chip, Empty, Photo, Row, T } from '../src/components/ui';
import { useStore } from '../src/store';
import { space, theme } from '../src/theme';
import { SUPPLIER_LABEL } from '../src/types';
import { money, priceParts, weightParts } from '../src/units';

export default function Results() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, userById, me } = useStore();
  const req = state.request;

  const matches = useMemo(() => {
    const qtyKg = req?.qtyKg ?? 0;
    let pool = state.posts.filter((p) => p.listing?.active && p.userId !== me?.id);
    if (req?.shippingIncluded) pool = pool.filter((p) => p.listing!.shippingIncluded);
    return pool
      .filter((p) => p.listing!.lotKg >= qtyKg)
      .sort((a, b) => a.listing!.pricePerKg - b.listing!.pricePerKg);
  }, [state.posts, req, me]);

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
          matches.map((p) => {
            const l = p.listing!;
            const seller = userById(p.userId);
            const price = priceParts(l.pricePerKg);
            const lot = weightParts(l.lotKg);
            const forYou = Math.min(req.qtyKg, l.lotKg);
            return (
              <Card key={p.id} onPress={() => router.push(`/post/${p.id}`)} style={{ padding: space.md }}>
                <Row style={{ alignItems: 'flex-start', gap: space.md }}>
                  <Photo uri={p.photos[0]} style={{ width: 92, height: 92 }} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <T size={15} weight="700" numberOfLines={2}>
                      {p.caption || 'Post'}
                    </T>
                    <T size={12.5} color={theme.muted} numberOfLines={1}>
                      {seller?.name || 'Beans user'}
                      {seller?.supplierType ? ` · ${SUPPLIER_LABEL[seller.supplierType]}` : ''}
                    </T>
                    <Row style={{ gap: 6, marginTop: 2 }}>
                      <T size={15} weight="700" color={theme.accent}>
                        {price.perKg}
                      </T>
                      <T size={13} color={theme.inkSoft}>
                        · {price.perLb}
                      </T>
                    </Row>
                    <T size={12.5} color={theme.inkSoft}>
                      {lot.kg} / {lot.lb}
                    </T>
                    <Row style={{ gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      <Chip
                        label={l.shippingIncluded ? 'Shipping included' : 'Shipping not included'}
                        tone={l.shippingIncluded ? 'good' : 'warn'}
                      />
                      <Chip label={`${money(l.pricePerKg * forYou)} for you`} tone="gold" />
                    </Row>
                  </View>
                </Row>
              </Card>
            );
          })
        )}
      </ScrollView>
    </>
  );
}
