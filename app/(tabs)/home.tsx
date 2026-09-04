import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { ListingCard } from '../../src/components/ListingCard';
import { Btn, Card, Checkbox, Chip, Empty, Field, Label, Row, Segmented, Sub, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { radius, space, theme } from '../../src/theme';
import { SUPPLIER_LABEL } from '../../src/types';
import { Unit, toKg, weightParts } from '../../src/units';

export default function Home() {
  const { me } = useStore();
  if (!me) return null;
  return me.role === 'supplier' ? <SupplierHome /> : <CustomerHome />;
}

/* =========================================================== customer ==== */

function CustomerHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, setRequest, me } = useStore();

  const [qty, setQty] = useState(state.request ? String(state.request.qty) : '');
  const [unit, setUnit] = useState<Unit>(state.request?.unit ?? 'kg');
  const [shippingIncluded, setShippingIncluded] = useState(state.request?.shippingIncluded ?? false);
  const [address, setAddress] = useState(state.request?.address ?? '');

  const value = parseFloat(qty.replace(',', '.'));
  const valid = isFinite(value) && value > 0;
  const qtyKg = valid ? toKg(value, unit) : 0;

  const ready = valid && (!shippingIncluded || address.trim().length > 5);

  const search = () => {
    setRequest({ qty: value, unit, qtyKg, shippingIncluded, address: address.trim() });
    router.push('/results');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space.xxl,
          paddingHorizontal: space.lg,
          paddingBottom: insets.bottom + 120,
          gap: space.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', gap: 2 }}>
          <T size={34} weight="800" style={{ letterSpacing: -1 }}>
            Beans
          </T>
          <Sub>How much coffee are you looking for?</Sub>
        </View>

        <Card style={{ gap: space.lg }}>
          {/* The amount — typed in kg or lb, always shown in both. */}
          <View style={{ gap: space.sm }}>
            <Row style={{ gap: space.sm, alignItems: 'stretch' }}>
              <TextInput
                value={qty}
                onChangeText={setQty}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={theme.line}
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: 76,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: theme.line,
                  backgroundColor: theme.cardSolid,
                  paddingHorizontal: space.lg,
                  fontSize: 34,
                  fontWeight: '700',
                  color: theme.ink,
                }}
              />
              <View style={{ width: 128, justifyContent: 'center' }}>
                <Segmented
                  value={unit}
                  onChange={setUnit}
                  options={[
                    { value: 'kg', label: 'kg' },
                    { value: 'lb', label: 'lb' },
                  ]}
                />
              </View>
            </Row>

            <T size={13.5} color={theme.muted}>
              {valid
                ? `= ${weightParts(qtyKg).kg} / ${weightParts(qtyKg).lb}`
                : 'Type an amount in kilograms or pounds — we show both everywhere.'}
            </T>
          </View>

          {/* Shipping, and where it is going. */}
          <View style={{ gap: space.sm }}>
            <Checkbox
              checked={shippingIncluded}
              onToggle={() => setShippingIncluded((v) => !v)}
              label="Shipping included"
              sublabel="Only show listings where the price already covers delivery."
            />

            {shippingIncluded ? (
              <Field
                label="Shipping address"
                value={address}
                onChangeText={setAddress}
                placeholder="742 Evergreen Terrace, Denver, CO 80202"
                multiline
                style={{ marginTop: space.xs }}
                hint="US addresses only."
              />
            ) : null}
          </View>

          <Btn title="Find beans" onPress={search} disabled={!ready} />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* =========================================================== supplier ==== */

function SupplierHome() {
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
