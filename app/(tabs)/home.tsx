import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Btn, Card, Checkbox, Field, Label, Segmented, Sub, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { radius, space, theme } from '../../src/theme';
import { SUPPLIER_LABEL, SupplierType } from '../../src/types';
import { Unit, toKg, weightParts } from '../../src/units';

const TYPES: SupplierType[] = ['farmer', 'bulk', 'online_retail', 'coffee_shop'];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, setRequest, me, becomeSupplier } = useStore();

  const [qty, setQty] = useState(state.request ? String(state.request.qty) : '');
  const [unit, setUnit] = useState<Unit>(state.request?.unit ?? 'kg');
  const [shippingIncluded, setShippingIncluded] = useState(state.request?.shippingIncluded ?? false);
  const [address, setAddress] = useState(state.request?.address ?? '');
  const [picking, setPicking] = useState(false);

  if (!me) return null;

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
          gap: space.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', gap: 2, marginBottom: space.sm }}>
          <T size={34} weight="800" style={{ letterSpacing: -1 }}>
            Beans
          </T>
          <Sub>How much coffee?</Sub>
        </View>

        <Card style={{ gap: space.lg }}>
          <View style={{ gap: space.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: space.sm }}>
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
            </View>

            {valid ? (
              <T size={13.5} color={theme.muted}>
                {weightParts(qtyKg).kg} / {weightParts(qtyKg).lb}
              </T>
            ) : null}
          </View>

          <View style={{ gap: space.sm }}>
            <Checkbox
              checked={shippingIncluded}
              onToggle={() => setShippingIncluded((v) => !v)}
              label="Shipping included"
            />

            {shippingIncluded ? (
              <Field
                value={address}
                onChangeText={setAddress}
                placeholder="Shipping address"
                multiline
                style={{ marginTop: space.xs }}
              />
            ) : null}
          </View>

          <Btn title="Find beans" onPress={search} disabled={!ready} />
        </Card>

        {/* Everyone starts as a buyer. This is how you start selling. */}
        {me.role === 'supplier' ? (
          <Btn title="My listings" kind="ghost" onPress={() => router.navigate('/listings')} />
        ) : picking ? (
          <Card style={{ gap: space.sm }}>
            <Label>What do you sell as</Label>
            {TYPES.map((t) => (
              <Btn
                key={t}
                title={SUPPLIER_LABEL[t]}
                kind="soft"
                onPress={() => {
                  becomeSupplier(t);
                  setPicking(false);
                  router.navigate('/listings');
                }}
              />
            ))}
            <Btn title="Cancel" kind="ghost" onPress={() => setPicking(false)} />
          </Card>
        ) : (
          <Btn title="I am also a supplier" kind="ghost" onPress={() => setPicking(true)} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
