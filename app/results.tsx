import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../src/components/Header';
import { Chip, Empty, Photo, Row, T } from '../src/components/ui';
import { caseKg, priceLines, shipsLine } from '../src/listing';
import { matches as matchesQuery, queryTerms, searchText } from '../src/search';
import { SourcingRequest, useStore } from '../src/store';
import { space, theme, track } from '../src/theme';
import { categoryName, cuisineName, useLang } from '../src/i18n';
import { Post } from '../src/types';
import { weightParts } from '../src/units';

const W = Dimensions.get('window').width;
const COL = (W - space.lg * 2 - 2) / 2;

/** Whether a listing can fill the amount asked for — enough stock, and not under its minimum. */
function fits(p: Post, req: SourcingRequest) {
  const l = p.listing!;
  if (!req.qty) return true;
  if (req.unit === 'case') {
    return l.sellBy === 'case' && (l.casesAvailable ?? 0) >= req.qty && l.minOrder <= req.qty;
  }
  const minKg = l.sellBy === 'case' ? l.minOrder * caseKg(l) : l.minOrder;
  return l.lotKg >= req.qtyKg && minKg <= req.qtyKg;
}

export default function Results() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, userById, me } = useStore();
  const { lang } = useLang();
  const req = state.request;
  // Tariffs and the end of de minimis made "already here" the question
  // buyers ask first, so it gets its own switch.
  const [usOnly, setUsOnly] = useState(false);

  const matches = useMemo(() => {
    if (!req) return [];
    const terms = queryTerms(req.text);
    return state.posts
      .filter((p) => p.listing?.active && p.userId !== me?.id)
      .filter((p) => req.category === 'all' || p.listing!.category === req.category)
      .filter((p) => req.cuisine === 'all' || p.listing!.cuisines.includes(req.cuisine))
      .filter((p) => !req.shippingIncluded || p.listing!.shippingIncluded)
      .filter((p) => !usOnly || p.listing!.shipsFrom === 'us')
      .filter((p) => {
        if (!terms.length) return true;
        return matchesQuery(terms, searchText(p.caption, p.listing!));
      })
      .filter((p) => fits(p, req))
      .sort((a, b) => a.listing!.pricePerKg - b.listing!.pricePerKg);
  }, [state.posts, req, me, usOnly]);

  if (!req) {
    return (
      <>
        <Header back title="Results" />
        <Empty title="Nothing searched" />
      </>
    );
  }

  const what = [
    req.text,
    req.cuisine === 'all' ? null : cuisineName(req.cuisine, lang),
    req.category === 'all' ? null : categoryName(req.category, lang),
  ]
    .filter(Boolean)
    .join(' · ');
  const amount = !req.qty
    ? null
    : req.unit === 'case'
      ? `${req.qty} ${req.qty === 1 ? 'case' : 'cases'}`
      : `${weightParts(req.qtyKg).kg} / ${weightParts(req.qtyKg).lb}`;

  return (
    <>
      <Header
        back
        title={what || 'Everything'}
        subtitle={[amount, req.shippingIncluded ? 'Shipping included' : null].filter(Boolean).join(' · ') || undefined}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 120 }}>
        <Row style={{ marginBottom: space.md }}>
          <Chip label="US stock only" selected={usOnly} onPress={() => setUsOnly((v) => !v)} />
        </Row>

        {matches.length === 0 ? (
          <Empty title="Nothing yet" />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
            {matches.map((p) => {
              const l = p.listing!;
              const seller = userById(p.userId);
              const price = priceLines(l, lang);
              return (
                <Pressable key={p.id} onPress={() => router.push(`/post/${p.id}`)} style={{ width: COL }}>
                  <Photo uri={p.photos[0]} style={{ width: COL, height: COL * 1.35 }} />
                  <View style={{ paddingVertical: space.md, gap: 3 }}>
                    <T size={12} weight="300" numberOfLines={1}>
                      {p.caption || categoryName(l.category, lang)}
                    </T>
                    <T size={9.5} color={theme.muted} style={{ letterSpacing: track.label, textTransform: 'uppercase' }}>
                      {seller?.name || 'Beans user'}
                    </T>
                    <T size={12} weight="400" style={{ marginTop: 2 }}>
                      {price.main}
                    </T>
                    <T size={10} color={theme.inkSoft}>
                      {price.sub}
                    </T>
                    <T size={9.5} color={theme.muted} style={{ letterSpacing: track.label, textTransform: 'uppercase' }}>
                      {shipsLine(l, lang)}
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
