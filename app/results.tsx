import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../src/components/Header';
import { Empty, Photo, T } from '../src/components/ui';
import { useStore } from '../src/store';
import { space, theme, track } from '../src/theme';
import { priceParts, weightParts } from '../src/units';

const W = Dimensions.get('window').width;
const COL = (W - space.lg * 2 - 2) / 2;

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
        <Empty title="No amount set" />
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

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 120 }}>
        {matches.length === 0 ? (
          <Empty title="Nothing yet" />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
            {matches.map((p) => {
              const l = p.listing!;
              const seller = userById(p.userId);
              return (
                <Pressable key={p.id} onPress={() => router.push(`/post/${p.id}`)} style={{ width: COL }}>
                  <Photo uri={p.photos[0]} style={{ width: COL, height: COL * 1.35 }} />
                  <View style={{ paddingVertical: space.md, gap: 3 }}>
                    <T size={12} weight="300" numberOfLines={1}>
                      {p.caption || 'Post'}
                    </T>
                    <T size={9.5} color={theme.muted} style={{ letterSpacing: track.label, textTransform: 'uppercase' }}>
                      {seller?.name || 'Beans user'}
                    </T>
                    <T size={12} weight="400" style={{ marginTop: 2 }}>
                      {priceParts(l.pricePerKg).perKg}
                    </T>
                    <T size={10} color={theme.inkSoft}>
                      {priceParts(l.pricePerKg).perLb}
                    </T>
                    <T size={9.5} color={theme.muted} style={{ letterSpacing: track.label }}>
                      {weightParts(l.lotKg).kg} / {weightParts(l.lotKg).lb}
                    </T>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </>
  );
}
