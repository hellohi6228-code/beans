import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Btn, Card, Checkbox, Field, Segmented, Sub, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { radius, space, theme } from '../../src/theme';
import { Unit, toKg, weightParts } from '../../src/units';

/**
 * The front page for everyone — a farmer buying from another farmer sees the
 * same question a home roaster does: how much, and is shipping included.
 */
export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, setRequest, me } = useStore();

  const [qty, setQty] = useState(state.request ? String(state.request.qty) : '');
  const [unit, setUnit] = useState<Unit>(state.request?.unit ?? 'kg');
  const [shippingIncluded, setShippingIncluded] = useState(state.request?.shippingIncluded ?? false);
  const [address, setAddress] = useState(state.request?.address ?? '');

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
