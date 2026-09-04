import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { ListingCard } from '../../src/components/ListingCard';
import { Btn, Card, Chip, Empty, Label, Row, Sub, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { space, theme } from '../../src/theme';
import { SUPPLIER_LABEL } from '../../src/types';

/** The selling side of an account. Buying lives on the Find beans tab, same as everyone. */
export default function Listings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { me, listingsOf, ratingOf, reportsAgainst, state } = useStore();
  if (!me) return null;

  const listings = listingsOf(me.id);
  const rating = ratingOf(me.id);
  const reports = reportsAgainst(me.id);
  const openOrders = state.orders.filter((o) => o.supplierId === me.id && o.status === 'inquiry');

  return (
    <>
      <Header
        title={me.name}
        subtitle={`${SUPPLIER_LABEL[me.supplierType ?? 'bulk']} · @${me.handle}`}
        right={<Chip label="+ New listing" onPress={() => router.push('/new-listing')} />}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: space.lg,
          paddingBottom: insets.bottom + 120,
          gap: space.md,
        }}
      >
        <Row style={{ gap: space.sm }}>
          <Stat label="Listings" value={String(listings.length)} />
          <Stat label="New enquiries" value={String(openOrders.length)} />
          <Stat label="Rating" value={rating.count ? rating.avg.toFixed(1) : '—'} />
        </Row>

        {reports.length ? (
          <Card
            style={{ backgroundColor: theme.warnSoft, borderColor: theme.warnSoft, gap: space.xs }}
            onPress={() => router.push('/reports')}
          >
            <T size={14} weight="700" color={theme.warn}>
              {reports.length} price discrepancy {reports.length === 1 ? 'report' : 'reports'}
            </T>
            <Sub>A buyer says they were asked for a different price than the one you listed. Tap to read them.</Sub>
          </Card>
        ) : null}

        <Label>Your listings</Label>

        {listings.length === 0 ? (
          <Card>
            <Empty
              glyph="🫘"
              title="No listings yet"
              body="Photograph a lot, name your price per kg or lb, and say whether shipping is included."
            />
            <Btn title="Create your first listing" onPress={() => router.push('/new-listing')} />
          </Card>
        ) : (
          listings.map((l) => <ListingCard key={l.id} listing={l} supplier={me} />)
        )}

        <Btn title="Post to your profile" kind="ghost" onPress={() => router.push('/new-post')} />
      </ScrollView>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card style={{ flex: 1, padding: space.md, alignItems: 'center', gap: 2 }}>
      <T size={22} weight="800">
        {value}
      </T>
      <T size={11.5} color={theme.muted} weight="600">
        {label}
      </T>
    </Card>
  );
}
