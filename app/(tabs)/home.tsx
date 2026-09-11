import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Btn, Checkbox, Field, Label, Rule, Segmented, T } from '../../src/components/ui';
import { useStore } from '../../src/store';
import { space, theme, track } from '../../src/theme';
import { SUPPLIER_LABEL, SupplierType } from '../../src/types';
import { Unit, toKg, weightParts } from '../../src/units';

const TYPES: SupplierType[] = ['farmer', 'bulk', 'online_retail', 'coffee_shop'];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, setRequest, me, becomeSupplier, updateMe, startTutorial } = useStore();

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
          paddingTop: space.xxl,
          paddingHorizontal: space.lg,
          paddingBottom: insets.bottom + 120,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', marginBottom: space.xxl }}>
          <Image
            source={require('../../assets/logo-mark.png')}
            resizeMode="contain"
            style={{ width: 132, height: 132 }}
          />
        </View>

        <Label>How much beans</Label>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.lg, marginTop: space.md }}>
          <TextInput
            value={qty}
            onChangeText={setQty}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={theme.line}
            style={{
              flex: 1,
              minWidth: 0,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: theme.ink,
              paddingVertical: 6,
              fontSize: 38,
              fontWeight: '200',
              color: theme.ink,
            }}
          />
          <View style={{ width: 110 }}>
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
          <T size={10} color={theme.muted} style={{ letterSpacing: track.label, marginTop: space.md }}>
            {weightParts(qtyKg).kg} / {weightParts(qtyKg).lb}
          </T>
        ) : null}

        <View style={{ marginTop: space.xl, gap: space.lg }}>
          <Checkbox
            checked={shippingIncluded}
            onToggle={() => setShippingIncluded((v) => !v)}
            label="Shipping included"
          />

          {shippingIncluded ? (
            <Field value={address} onChangeText={setAddress} placeholder="Shipping address" multiline />
          ) : null}
        </View>

        <Btn title="Find beans" onPress={search} disabled={!ready} style={{ marginTop: space.xl }} />

        <View style={{ marginTop: space.xxl }}>
          <Rule />
          {me.role === 'supplier' ? (
            <Btn
              title="I'm not selling now"
              kind="text"
              onPress={() =>
                Alert.alert('Stop selling?', 'Every listing you have will switch off. You can turn it back on any time.', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: () => updateMe({ role: 'customer', supplierType: undefined }),
                  },
                ])
              }
              style={{ marginTop: space.lg }}
            />
          ) : picking ? (
            <View style={{ paddingTop: space.lg, gap: space.md }}>
              <Label>You are a</Label>
              {TYPES.map((t) => (
                <Btn
                  key={t}
                  title={SUPPLIER_LABEL[t]}
                  kind="outline"
                  onPress={async () => {
                    await becomeSupplier(t);
                    setPicking(false);
                    startTutorial();
                  }}
                />
              ))}
              <Btn title="Cancel" kind="text" onPress={() => setPicking(false)} />
            </View>
          ) : (
            <Btn
              title="I sell coffee beans too"
              kind="text"
              onPress={() => setPicking(true)}
              style={{ marginTop: space.lg }}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
