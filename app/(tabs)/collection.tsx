import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { Btn, Card, Chip, Label, Row, Sub, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { radius, space, theme } from '../../src/theme';
import { money, weightParts } from '../../src/units';

const W = Dimensions.get('window').width;
const TILE = (W - space.lg * 2 - space.sm) / 2;

export default function Collection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { me, badgesFor, ordersOfCustomer, listingById, userById } = useStore();
  if (!me) return null;

  const badges = badgesFor(me.id);
  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);
  const orders = ordersOfCustomer(me.id);
  const toReview = orders.filter((o) => o.status === 'completed' && !o.reviewed);
  const totalKg = orders
    .filter((o) => o.status === 'completed' || o.status === 'agreed')
    .reduce((s, o) => s + o.qtyKg, 0);

  return (
    <>
      <Header title="Collection" subtitle={`${earned.length} of ${badges.length} badges earned`} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 120, gap: space.md }}
      >
        <Row style={{ gap: space.sm }}>
          <Stat label="Badges" value={`${earned.length}/${badges.length}`} />
          <Stat label="Orders" value={String(orders.length)} />
          <Stat label="Bought" value={weightParts(totalKg).kg} sub={weightParts(totalKg).lb} />
        </Row>

        {toReview.length ? (
          <Card style={{ backgroundColor: theme.goldSoft, borderColor: theme.goldSoft, gap: space.sm }}>
            <T size={15} weight="700" color={theme.gold}>
              {toReview.length} order{toReview.length === 1 ? '' : 's'} waiting on your review
            </T>
            <Sub>Reviews are how badges unlock — and how other buyers find honest suppliers.</Sub>
            {toReview.map((o) => (
              <Btn
                key={o.id}
                title={`Review ${listingById(o.listingId)?.title ?? 'your order'}`}
                kind="soft"
                onPress={() => router.push(`/review/${o.id}`)}
                style={{ height: 44 }}
              />
            ))}
          </Card>
        ) : null}

        <Label>Earned</Label>
        {earned.length === 0 ? (
          <Card>
            <Sub>No badges yet. Your first order unlocks First Pour.</Sub>
          </Card>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {earned.map((b) => (
              <BadgeTile key={b.badge.id} {...b} />
            ))}
          </View>
        )}

        <Label>Still to unlock</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {locked.map((b) => (
            <BadgeTile key={b.badge.id} {...b} />
          ))}
        </View>

        <Label>Your orders</Label>
        {orders.length === 0 ? (
          <Card>
            <Sub>Nothing yet.</Sub>
          </Card>
        ) : (
          orders.map((o) => {
            const listing = listingById(o.listingId);
            const supplier = userById(o.supplierId);
            return (
              <Card key={o.id} style={{ padding: space.md, gap: 4 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <T size={15} weight="700" numberOfLines={1} style={{ flex: 1 }}>
                    {listing?.title ?? 'Listing'}
                  </T>
                  <T size={15} weight="700">
                    {money(o.lockedTotal)}
                  </T>
                </Row>
                <T size={12.5} color={theme.muted}>
                  {supplier?.name} · {weightParts(o.qtyKg).kg} / {weightParts(o.qtyKg).lb}
                </T>
                <Row style={{ gap: 6, marginTop: 2 }}>
                  <Chip
                    label={o.status === 'completed' ? 'Completed' : o.status === 'agreed' ? 'Agreed' : 'Enquiry'}
                    tone={o.status === 'completed' ? 'good' : 'neutral'}
                  />
                  <Chip
                    label={o.shippingIncluded ? 'Shipping included' : 'Shipping separate'}
                    tone={o.shippingIncluded ? 'good' : 'warn'}
                  />
                  {o.reviewed ? <Chip label="Reviewed" tone="gold" /> : null}
                </Row>
              </Card>
            );
          })
        )}
      </ScrollView>
    </>
  );
}

function BadgeTile({
  badge,
  earned,
  have,
  need,
}: ReturnType<ReturnType<typeof useStore>['badgesFor']>[number]) {
  const pct = Math.min(have / need, 1);
  return (
    <Card
      style={{
        width: TILE,
        padding: space.md,
        gap: 4,
        opacity: earned ? 1 : 0.72,
        backgroundColor: earned ? theme.goldSoft : theme.card,
        borderColor: earned ? '#EBD9AF' : 'rgba(255,255,255,0.75)',
      }}
    >
      <T size={26} style={{ opacity: earned ? 1 : 0.35 }}>
        {badge.glyph}
      </T>
      <T size={14.5} weight="700">
        {badge.name}
      </T>
      <T size={12} color={theme.muted} style={{ lineHeight: 16 }}>
        {badge.blurb}
      </T>
      {!earned ? (
        <View style={{ marginTop: 4, gap: 3 }}>
          <View style={{ height: 5, borderRadius: 3, backgroundColor: theme.line, overflow: 'hidden' }}>
            <View style={{ width: `${pct * 100}%`, height: 5, backgroundColor: theme.accent, borderRadius: 3 }} />
          </View>
          <T size={11} color={theme.muted}>
            {have} / {need}
          </T>
        </View>
      ) : (
        <T size={11} weight="700" color={theme.gold} style={{ marginTop: 4 }}>
          EARNED
        </T>
      )}
    </Card>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card style={{ flex: 1, padding: space.md, alignItems: 'center', gap: 1, borderRadius: radius.lg }}>
      <T size={18} weight="800">
        {value}
      </T>
      {sub ? (
        <T size={11.5} color={theme.inkSoft} weight="600">
          {sub}
        </T>
      ) : null}
      <T size={11} color={theme.muted} weight="600">
        {label}
      </T>
    </Card>
  );
}
