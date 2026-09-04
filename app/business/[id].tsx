import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { ListingCard } from '../../src/components/ListingCard';
import { PostTile } from '../../src/components/PostTile';
import { Avatar, Btn, Card, Empty, Photo, Row, Segmented, Stars, Sub, T } from '../../src/components/ui';
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
  const { userById, postsOf, listingsOf, reviewsOfSupplier, ratingOf, openThread, me, state } = useStore();

  const user = userById(String(id));
  const [tab, setTab] = useState<Tab>('posts');

  if (!user) return <Header back title="Not found" />;

  const posts = postsOf(user.id);
  const listings = listingsOf(user.id);
  const reviews = reviewsOfSupplier(user.id);
  const rating = ratingOf(user.id);
  const mine = me?.id === user.id;

  return (
    <>
      <Header back title={user.name || 'Profile'} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 120, gap: space.md }}
      >
        <Card style={{ gap: space.md }}>
          <Row style={{ gap: space.lg }}>
            <Avatar uri={user.avatar} name={user.name || '?'} size={72} />
            <View style={{ flex: 1, gap: 2 }}>
              <T size={18} weight="700">
                {user.name}
              </T>
              {user.supplierType ? (
                <T size={13} color={theme.muted}>
                  {SUPPLIER_LABEL[user.supplierType]}
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

          {user.bio ? <Sub>{user.bio}</Sub> : null}

          {!mine && me ? (
            <Btn title="Message" kind="soft" onPress={() => router.push(`/chat/${openThread(user.id)}`)} />
          ) : null}
        </Card>

        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'posts' as Tab, label: `Posts ${posts.length}` },
            { value: 'listings' as Tab, label: `Listings ${listings.length}` },
            { value: 'reviews' as Tab, label: `Reviews ${reviews.length}` },
          ]}
        />

        {tab === 'posts' ? (
          posts.length === 0 ? (
            <Card>
              <Empty glyph="📷" title="No posts" />
            </Card>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
              {posts.map((p) => (
                <PostTile key={p.id} post={p} size={TILE} />
              ))}
            </View>
          )
        ) : null}

        {tab === 'listings' ? (
          listings.length === 0 ? (
            <Card>
              <Empty glyph="🫘" title="No listings" />
            </Card>
          ) : (
            listings.map((l) => (
              <ListingCard key={l.id} listing={l} supplier={user} qtyKg={state.request?.qtyKg} />
            ))
          )
        ) : null}

        {tab === 'reviews' ? (
          reviews.length === 0 ? (
            <Card>
              <Empty glyph="⭐" title="No reviews" />
            </Card>
          ) : (
            reviews.map((r) => {
              const author = userById(r.customerId);
              return (
                <Card key={r.id} style={{ padding: space.md, gap: space.xs }}>
                  <Row style={{ gap: space.sm }}>
                    <Avatar name={author?.name || '?'} uri={author?.avatar} size={32} />
                    <View style={{ flex: 1 }}>
                      <T size={14} weight="600">
                        {author?.name || 'Buyer'}
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
