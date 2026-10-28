import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { LangPicker } from '../src/components/LangPicker';
import { Btn, Chip, Field, Label, Segmented } from '../src/components/ui';
import { supplierName, useLang } from '../src/i18n';
import { useStore } from '../src/store';
import { space } from '../src/theme';
import { Role, SUPPLIER_TYPES, SupplierType } from '../src/types';

/** Once per account: buyer or seller, and where things ship. Neither can be skipped. */
export default function Onboarding() {
  const router = useRouter();
  const { me, onboard, startTutorial } = useStore();
  const { lang } = useLang();

  const [role, setRole] = useState<Role>(me?.role ?? 'customer');
  const [supplierType, setSupplierType] = useState<SupplierType | undefined>(me?.supplierType);
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);

  const ready = address.trim().length > 0 && (role === 'customer' || !!supplierType);

  const start = async () => {
    setBusy(true);
    try {
      await onboard({ role, supplierType, address });
      router.replace('/home');
      if (role === 'supplier') startTutorial();
    } catch (err: any) {
      Alert.alert('Could not save', err?.message ?? 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ paddingTop: space.xxl, paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.xl }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center' }}>
          <Image source={require('../assets/logo-mark.png')} resizeMode="contain" style={{ width: 132, height: 132 }} />
        </View>

        <LangPicker />

        <View style={{ gap: space.sm }}>
          <Label>I am</Label>
          <Segmented
            value={role}
            onChange={setRole}
            options={[
              { value: 'customer', label: 'Buyer' },
              { value: 'supplier', label: 'Seller' },
            ]}
          />
        </View>

        {role === 'supplier' ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {SUPPLIER_TYPES.map((t) => (
              <Chip key={t} label={supplierName(t, lang)} selected={supplierType === t} onPress={() => setSupplierType(t)} />
            ))}
          </View>
        ) : null}

        <Field
          label="Shipping address"
          value={address}
          onChangeText={setAddress}
          placeholder="Street, city, state, ZIP"
          multiline
        />

        <Btn title="Start" onPress={start} disabled={!ready} busy={busy} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
