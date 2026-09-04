import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { ListingCard } from '../../src/components/ListingCard';
import { Btn, Card, Empty } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { space } from '../../src/theme';

export default function Listings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { me, listingsOf } = useStore();
  if (!me) return null;

  const listings = listingsOf(me.id);

  return (
    <>
      <Header title="My listings" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 120, gap: space.md }}
      >
        {listings.length === 0 ? (
          <Card style={{ gap: space.md }}>
            <Empty glyph="🫘" title="Nothing listed yet" />
            <Btn title="New listing" onPress={() => router.push('/new-listing')} />
          </Card>
        ) : (
          <>
            <Btn title="New listing" onPress={() => router.push('/new-listing')} />
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} supplier={me} />
            ))}
          </>
        )}
      </ScrollView>
    </>
  );
}
