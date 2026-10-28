import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { LangPicker } from '../src/components/LangPicker';
import { Btn, Chip, Field, Label, Segmented } from '../src/components/ui';
import { originName, pair, supplierName, useLang, words } from '../src/i18n';
import { useStore } from '../src/store';
import { space } from '../src/theme';
import { ORIGINS, Origin, Role, SUPPLIER_TYPES, SupplierType } from '../src/types';

/**
 * Once per account, and neither path can be skipped. A buyer gives the
 * address their orders ship to. A seller — usually a producer or exporter
 * abroad — says what kind of business they are and where their goods ship
 * from; they don't give an address.
 */
export default function Onboarding() {
  const router = useRouter();
  const { me, onboard, startTutorial } = useStore();
  const { lang } = useLang();

  const [role, setRole] = useState<Role>(me?.role ?? 'customer');
  const [supplierType, setSupplierType] = useState<SupplierType | undefined>(me?.supplierType);
  const [shipsFrom, setShipsFrom] = useState<'us' | Origin | undefined>(me?.shipsFrom);
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);

  const ready = role === 'customer' ? address.trim().length > 0 : !!supplierType && !!shipsFrom;

  const start = async () => {
    setBusy(true);
    try {
      if (role === 'supplier') {
        await onboard({ role, supplierType: supplierType!, shipsFrom: shipsFrom! });
        router.replace('/live');
        startTutorial();
      } else {
        await onboard({ role, address });
        router.replace('/home');
      }
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
          <>
            <View style={{ gap: space.sm }}>
              <Label>Business</Label>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {SUPPLIER_TYPES.map((t) => (
                  <Chip key={t} label={supplierName(t, lang)} selected={supplierType === t} onPress={() => setSupplierType(t)} />
                ))}
              </View>
            </View>

            <View style={{ gap: space.sm }}>
              <Label>Ships from</Label>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {ORIGINS.map((o) => (
                  <Chip key={o} label={originName(o, lang)} selected={shipsFrom === o} onPress={() => setShipsFrom(o)} />
                ))}
                <Chip
                  label={pair('US warehouse', words(lang)?.usStock)}
                  selected={shipsFrom === 'us'}
                  onPress={() => setShipsFrom('us')}
                />
              </View>
            </View>
          </>
        ) : (
          <Field
            label="Shipping address"
            value={address}
            onChangeText={setAddress}
            placeholder="Street, city, state, ZIP"
            multiline
          />
        )}

        <Btn title="Start" onPress={start} disabled={!ready} busy={busy} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
