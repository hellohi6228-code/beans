import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { PostTile } from '../../src/components/PostTile';
import { Avatar, Btn, Card, Chip, Empty, Label, Row, Stars, Sub, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { space, theme } from '../../src/theme';
import { SUPPLIER_LABEL } from '../../src/types';
import { money, weightParts } from '../../src/units';

const W = Dimensions.get('window').width;
const TILE = (W - space.lg * 2 - space.xs * 2) / 3;
const BADGE = (W - space.lg * 2 - space.sm) / 2;

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { me, postsOf, ratingOf, badgesFor, ordersOfCustomer, listingById, userById } = useStore();
  if (!me) return null;

  const posts = postsOf(me.id);
  const rating = ratingOf(me.id);
  const badges = badgesFor(me.id);
  const earned = badges.filter((b) => b.earned);
  const orders = ordersOfCustomer(me.id);

  return (
    <>
      <Header title="Profile" right={<Chip label="Edit" onPress={() => router.push('/edit-profile')} />} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 120, gap: space.md }}
      >
        <Card style={{ gap: space.md }}>
          <Row style={{ gap: space.lg }}>
            <Avatar uri={me.avatar} name={me.name || 'You'} size={72} />
            <View style={{ flex: 1, gap: 2 }}>
              <T size={18} weight="700">
                {me.name || 'Add your name'}
              </T>
              {me.role === 'supplier' ? (
                <T size={13} color={theme.muted}>
                  {SUPPLIER_LABEL[me.supplierType ?? 'bulk']}
                </T>
              ) : null}
              {rating.count ? (
                <Row style={{ gap: 6 }}>
                  <Stars value={rating.avg} />
                  <T size={12.5} color={theme.muted}>
                    {rating.avg.toFixed(1)} ({rating.count})
                  </T>
                </Row>
              ) : null}
            </View>
          </Row>

          {me.bio ? <Sub>{me.bio}</Sub> : null}

          <Row style={{ gap: space.sm }}>
            <Btn title="New post" kind="soft" onPress={() => router.push('/new-post')} style={{ flex: 1 }} />
            {me.role === 'supplier' ? (
              <Btn title="New listing" onPress={() => router.push('/new-listing')} style={{ flex: 1 }} />
            ) : null}
          </Row>
        </Card>

        {posts.length === 0 ? (
          <Card style={{ gap: space.md }}>
            <Empty glyph="📷" title="No posts yet" />
            <Btn title="Take a photo" onPress={() => router.push('/new-post')} />
          </Card>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
            {posts.map((p) => (
              <PostTile key={p.id} post={p} size={TILE} />
            ))}
          </View>
        )}

        <Label>
          Badges {earned.length}/{badges.length}
        </Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {badges.map(({ badge, earned: got, have, need }) => (
            <Card
              key={badge.id}
              style={{
                width: BADGE,
                padding: space.md,
                gap: 3,
                opacity: got ? 1 : 0.7,
                backgroundColor: got ? theme.goldSoft : theme.card,
                borderColor: got ? '#EBD9AF' : 'rgba(255,255,255,0.75)',
              }}
            >
              <T size={24} style={{ opacity: got ? 1 : 0.35 }}>
                {badge.glyph}
              </T>
              <T size={14} weight="700">
                {badge.name}
              </T>
              <T size={11.5} color={theme.muted}>
                {badge.blurb}
              </T>
              {!got ? (
                <View style={{ marginTop: 3, gap: 3 }}>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: theme.line, overflow: 'hidden' }}>
                    <View
                      style={{
                        width: `${Math.min(have / need, 1) * 100}%`,
                        height: 4,
                        backgroundColor: theme.accent,
                      }}
                    />
                  </View>
                  <T size={11} color={theme.muted}>
                    {have} / {need}
                  </T>
                </View>
              ) : null}
            </Card>
          ))}
        </View>

        {orders.length ? (
          <>
            <Label>Orders</Label>
            {orders.map((o) => {
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
                  {!o.reviewed ? (
                    <Btn
                      title="Write a review"
                      kind="soft"
                      onPress={() => router.push(`/review/${o.id}`)}
                      style={{ height: 42, marginTop: 4 }}
                    />
                  ) : (
                    <Chip label="Reviewed" tone="gold" />
                  )}
                </Card>
              );
            })}
          </>
        ) : null}
      </ScrollView>
    </>
  );
}
