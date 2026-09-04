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

const W = Dimensions.get('window').width;
const TILE = (W - space.lg * 2 - space.xs * 2) / 3;

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { me, postsOf, listingsOf, ratingOf, reportsAgainst, badgesFor, signOut } = useStore();
  if (!me) return null;

  const isSupplier = me.role === 'supplier';
  const posts = postsOf(me.id);
  const listings = isSupplier ? listingsOf(me.id) : [];
  const rating = ratingOf(me.id);
  const reports = isSupplier ? reportsAgainst(me.id) : [];
  // Everyone buys, so everyone has a badge collection.
  const earned = badgesFor(me.id).filter((b) => b.earned);

  return (
    <>
      <Header
        title="Profile"
        right={<Chip label="Edit" onPress={() => router.push('/edit-profile')} />}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 120, gap: space.md }}
      >
        <Card style={{ gap: space.md }}>
          <Row style={{ gap: space.lg }}>
            <Avatar uri={me.avatar} name={me.name} size={72} />
            <View style={{ flex: 1, gap: 2 }}>
              <T size={18} weight="700">
                {me.name}
              </T>
              <T size={13} color={theme.muted}>
                @{me.handle}
              </T>
              <T size={13} color={theme.muted}>
                {isSupplier ? SUPPLIER_LABEL[me.supplierType ?? 'bulk'] : 'Buyer'}
                {me.location ? ` · ${me.location}` : ''}
              </T>
              {isSupplier && rating.count ? (
                <Row style={{ gap: 6 }}>
                  <Stars value={rating.avg} />
                  <T size={12.5} color={theme.muted}>
                    {rating.avg.toFixed(1)} ({rating.count})
                  </T>
                </Row>
              ) : null}
            </View>
          </Row>

          {me.bio ? <Sub>{me.bio}</Sub> : <Sub>No bio yet.</Sub>}

          <Row style={{ gap: space.sm }}>
            <Btn title="New post" kind="soft" onPress={() => router.push('/new-post')} style={{ flex: 1 }} />
            {isSupplier ? (
              <Btn title="New listing" onPress={() => router.push('/new-listing')} style={{ flex: 1 }} />
            ) : (
              <Btn
                title="View as others"
                kind="ghost"
                onPress={() => router.push(`/business/${me.id}`)}
                style={{ flex: 1 }}
              />
            )}
          </Row>
        </Card>

        {earned.length ? (
          <Card style={{ gap: space.sm }}>
            <Label>Badges</Label>
            <Row style={{ gap: 6, flexWrap: 'wrap' }}>
              {earned.map((b) => (
                <Chip key={b.badge.id} label={`${b.badge.glyph} ${b.badge.name}`} tone="gold" />
              ))}
            </Row>
          </Card>
        ) : null}

        {isSupplier ? (
          <Card
            onPress={() => router.push('/reports')}
            style={{
              padding: space.md,
              backgroundColor: reports.length ? theme.warnSoft : theme.card,
              borderColor: reports.length ? theme.warnSoft : 'rgba(255,255,255,0.75)',
            }}
          >
            <Row style={{ justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <T size={15} weight="700" color={reports.length ? theme.warn : theme.ink}>
                  Price reports
                </T>
                <T size={12.5} color={theme.muted}>
                  {reports.length ? `${reports.length} open` : 'None'}
                </T>
              </View>
              <T size={18} color={theme.muted}>
                ›
              </T>
            </Row>
          </Card>
        ) : null}

        {isSupplier ? (
          <>
            <Label>{listings.length} active listings</Label>
            {listings.length === 0 ? (
              <Card>
                <Sub>Nothing listed.</Sub>
              </Card>
            ) : null}
          </>
        ) : null}

        <Label>Posts</Label>
        {posts.length === 0 ? (
          <Card>
            <Empty
              glyph="📷"
              title="Nothing posted yet"
            />
          </Card>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
            {posts.map((p) => (
              <PostTile key={p.id} post={p} size={TILE} />
            ))}
          </View>
        )}

        <Btn
          title="Sign out"
          kind="ghost"
          onPress={() => {
            signOut();
            router.replace('/welcome');
          }}
        />
      </ScrollView>
    </>
  );
}
