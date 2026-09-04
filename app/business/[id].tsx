import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { ListingCard } from '../../src/components/ListingCard';
import { Avatar, Btn, Card, Chip, Empty, Photo, Row, Segmented, Stars, Sub, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { space, theme } from '../../src/theme';
import { SUPPLIER_LABEL } from '../../src/types';

const W = Dimensions.get('window').width;
const TILE = (W - space.lg * 2 - space.xs * 2) / 3;

type Tab = 'posts' | 'listings' | 'reviews';

export default function BusinessProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    userById,
    postsOf,
    listingsOf,
    reviewsOfSupplier,
    ratingOf,
    badgesFor,
    me,
    state,
    signIn,
  } = useStore();

  const user = userById(String(id));
  const [tab, setTab] = useState<Tab>('posts');

  if (!user) return <Header back title="Profile not found" />;

  const isSupplier = user.role === 'supplier';
  const posts = postsOf(user.id);
  const listings = isSupplier ? listingsOf(user.id) : [];
  const reviews = isSupplier
    ? reviewsOfSupplier(user.id)
    : state.reviews.filter((r) => r.customerId === user.id);
  const rating = ratingOf(user.id);
  const badges = !isSupplier ? badgesFor(user.id).filter((b) => b.earned) : [];
  const mine = me?.id === user.id;

  const existingThread = state.threads.find(
    (t) => (t.customerId === me?.id && t.supplierId === user.id) || (t.supplierId === me?.id && t.customerId === user.id)
  );

  const tabs: { value: Tab; label: string }[] = isSupplier
    ? [
        { value: 'posts', label: `Posts ${posts.length}` },
        { value: 'listings', label: `Listings ${listings.length}` },
        { value: 'reviews', label: `Reviews ${reviews.length}` },
      ]
    : [
        { value: 'posts', label: `Posts ${posts.length}` },
        { value: 'reviews', label: `Reviews ${reviews.length}` },
      ];

  return (
    <>
      <Header back title={user.name} subtitle={`@${user.handle}`} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + space.xxl, gap: space.md }}
      >
        <Card style={{ gap: space.md }}>
          <Row style={{ gap: space.lg }}>
            <Avatar uri={user.avatar} name={user.name} size={72} />
            <View style={{ flex: 1, gap: 2 }}>
              <T size={18} weight="700">
                {user.name}
              </T>
              <T size={13} color={theme.muted}>
                {isSupplier ? SUPPLIER_LABEL[user.supplierType ?? 'bulk'] : 'Buyer'} · {user.location}
              </T>
              {isSupplier && rating.count ? (
                <Row style={{ gap: 6 }}>
                  <Stars value={rating.avg} />
                  <T size={12.5} color={theme.muted}>
                    {rating.avg.toFixed(1)} ({rating.count})
                  </T>
                </Row>
              ) : null}
              {user.website ? (
                <T size={12.5} color={theme.accent}>
                  {user.website}
                </T>
              ) : null}
            </View>
          </Row>

          {user.bio ? <Sub>{user.bio}</Sub> : null}

          {!isSupplier && badges.length ? (
            <Row style={{ gap: 6, flexWrap: 'wrap' }}>
              {badges.slice(0, 8).map((b) => (
                <Chip key={b.badge.id} label={`${b.badge.glyph} ${b.badge.name}`} tone="gold" />
              ))}
            </Row>
          ) : null}

          {mine ? (
            <Row style={{ gap: space.sm }}>
              <Btn title="Edit profile" kind="ghost" onPress={() => router.push('/edit-profile')} style={{ flex: 1 }} />
              <Btn title="New post" kind="soft" onPress={() => router.push('/new-post')} style={{ flex: 1 }} />
            </Row>
          ) : me && isSupplier && me.role === 'customer' ? (
            <Btn
              title="Message this supplier"
              kind="soft"
              onPress={() => existingThread && router.push(`/chat/${existingThread.id}`)}
              disabled={!existingThread}
            />
          ) : null}

          {!me ? <Btn title="Sign in to order" kind="soft" onPress={() => signIn(user.id)} /> : null}
        </Card>

        <Segmented value={tab} onChange={setTab} options={tabs} />

        {tab === 'posts' ? (
          posts.length === 0 ? (
            <Card>
              <Empty
                glyph="📷"
                title="Nothing posted yet"
                body={mine ? 'Post pictures of your shop, your events, your merchandise.' : undefined}
              />
            </Card>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
              {posts.map((p) => (
                <Pressable key={p.id} onPress={() => router.push(`/post/${p.id}`)}>
                  <Photo
                    uri={p.photos[0]}
                    seed={p.id}
                    glyph={p.kind === 'event' ? '📅' : p.kind === 'merchandise' ? '🛍️' : '📷'}
                    style={{ width: TILE, height: TILE }}
                    radius={10}
                  />
                </Pressable>
              ))}
            </View>
          )
        ) : null}

        {tab === 'listings' ? (
          listings.length === 0 ? (
            <Card>
              <Empty glyph="🫘" title="No active listings" />
            </Card>
          ) : (
            listings.map((l) => <ListingCard key={l.id} listing={l} supplier={user} qtyKg={state.request?.qtyKg} />)
          )
        ) : null}

        {tab === 'reviews' ? (
          reviews.length === 0 ? (
            <Card>
              <Empty glyph="⭐" title="No reviews yet" />
            </Card>
          ) : (
            reviews.map((r) => {
              const other = userById(isSupplier ? r.customerId : r.supplierId);
              return (
                <Card key={r.id} style={{ padding: space.md, gap: space.xs }}>
                  <Row style={{ gap: space.sm }}>
                    <Avatar name={other?.name ?? '?'} uri={other?.avatar} size={32} />
                    <View style={{ flex: 1 }}>
                      <T size={14} weight="600">
                        {other?.name ?? 'Beans user'}
                      </T>
                      <Stars value={r.rating} />
                    </View>
                  </Row>
                  <Sub>{r.text}</Sub>
                  {r.photos.length ? (
                    <Row style={{ gap: space.xs }}>
                      {r.photos.map((uri, i) => (
                        <Photo key={i} uri={uri} style={{ width: 64, height: 64 }} radius={10} />
                      ))}
                    </Row>
                  ) : null}
                </Card>
              );
            })
          )
        ) : null}
      </ScrollView>
    </>
  );
}
