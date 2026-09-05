import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Header } from '../src/components/Header';
import { PhotoPicker } from '../src/components/PhotoPicker';
import { Btn, Checkbox, Field, Label, Row, Rule, Segmented, T } from '../src/components/ui';
import { uploadPhotos } from '../src/lib/supabase';
import { useStore } from '../src/store';
import { space, theme, track } from '../src/theme';
import { KG_PER_LB, Unit, money, priceParts, toKg, weightParts } from '../src/units';

export default function NewPost() {
  const router = useRouter();
  const { addPost, me } = useStore();

  const [photos, setPhotos] = useState<string[]>([]);
  const [caption, setCaption] = useState('');

  const [selling, setSelling] = useState(false);
  const [unit, setUnit] = useState<Unit>('kg');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [shippingIncluded, setShippingIncluded] = useState(false);
  const [busy, setBusy] = useState(false);

  const priceNum = parseFloat(price.replace(',', '.'));
  const amountNum = parseFloat(amount.replace(',', '.'));
  const pricePerKg = isFinite(priceNum) && priceNum > 0 ? (unit === 'kg' ? priceNum : priceNum / KG_PER_LB) : 0;
  const lotKg = isFinite(amountNum) && amountNum > 0 ? toKg(amountNum, unit) : 0;

  const ready = photos.length >= 1 && (!selling || (pricePerKg > 0 && lotKg > 0)) && !!me;

  const submit = async () => {
    if (!me) return;
    setBusy(true);
    try {
      const uploaded = await uploadPhotos(photos, me.id);
      await addPost({
        photos: uploaded,
        caption: caption.trim(),
        listing: selling ? { pricePerKg, lotKg, enteredUnit: unit, shippingIncluded, active: true } : undefined,
      });
      router.back();
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header back title="New post" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.xl }}
        keyboardShouldPersistTaps="handled"
      >
        <PhotoPicker photos={photos} onChange={setPhotos} max={3} />

        <Field label="Caption" value={caption} onChangeText={setCaption} multiline />

        <View>
          <Rule />
          <View style={{ paddingTop: space.lg, gap: space.lg }}>
            <Checkbox checked={selling} onToggle={() => setSelling((v) => !v)} label="Selling this" />

            {selling ? (
              <>
                <View style={{ gap: space.sm }}>
                  <Label>Units</Label>
                  <Segmented
                    value={unit}
                    onChange={setUnit}
                    options={[
                      { value: 'kg', label: 'kg' },
                      { value: 'lb', label: 'lb' },
                    ]}
                  />
                </View>

                <Row style={{ gap: space.lg, alignItems: 'flex-start' }}>
                  <Field
                    label={`Price per ${unit}`}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    style={{ flex: 1 }}
                  />
                  <Field
                    label={`Amount (${unit})`}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    style={{ flex: 1 }}
                  />
                </Row>

                {pricePerKg > 0 || lotKg > 0 ? (
                  <View style={{ gap: 3 }}>
                    {pricePerKg > 0 ? (
                      <T size={13} weight="400">
                        {priceParts(pricePerKg).perKg} · {priceParts(pricePerKg).perLb}
                      </T>
                    ) : null}
                    {lotKg > 0 ? (
                      <T size={10} color={theme.muted} style={{ letterSpacing: track.label }}>
                        {weightParts(lotKg).kg} / {weightParts(lotKg).lb}
                        {pricePerKg > 0 ? ` · ${money(pricePerKg * lotKg)}` : ''}
                      </T>
                    ) : null}
                  </View>
                ) : null}

                <Checkbox
                  checked={shippingIncluded}
                  onToggle={() => setShippingIncluded((v) => !v)}
                  label="Shipping included"
                />
              </>
            ) : null}
          </View>
        </View>

        <View style={{ gap: space.md }}>
          <Btn title="Post" onPress={submit} disabled={!ready} busy={busy} />
          <Btn title="Cancel" kind="text" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
