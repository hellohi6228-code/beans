import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Header } from '../src/components/Header';
import { PhotoPicker } from '../src/components/PhotoPicker';
import { Btn, Card, Checkbox, Field, Label, Row, Segmented, T } from '../src/components/ui';
import { useStore } from '../src/store';
import { space, theme } from '../src/theme';
import { KG_PER_LB, Unit, money, priceParts, toKg, weightParts } from '../src/units';

export default function NewPost() {
  const router = useRouter();
  const { addPost } = useStore();

  const [photos, setPhotos] = useState<string[]>([]);
  const [caption, setCaption] = useState('');

  const [selling, setSelling] = useState(false);
  const [unit, setUnit] = useState<Unit>('kg');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [shippingIncluded, setShippingIncluded] = useState(false);

  const priceNum = parseFloat(price.replace(',', '.'));
  const amountNum = parseFloat(amount.replace(',', '.'));
  const pricePerKg = isFinite(priceNum) && priceNum > 0 ? (unit === 'kg' ? priceNum : priceNum / KG_PER_LB) : 0;
  const lotKg = isFinite(amountNum) && amountNum > 0 ? toKg(amountNum, unit) : 0;

  const ready = photos.length >= 1 && (!selling || (pricePerKg > 0 && lotKg > 0));

  const submit = () => {
    addPost({
      photos,
      caption: caption.trim(),
      listing: selling ? { pricePerKg, lotKg, enteredUnit: unit, shippingIncluded, active: true } : undefined,
    });
    router.back();
  };

  const p = priceParts(pricePerKg);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header back title="New post" />

      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: space.md, paddingBottom: space.xxl }}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <PhotoPicker photos={photos} onChange={setPhotos} max={3} />
        </Card>

        <Card style={{ gap: space.lg }}>
          <Field label="Caption" value={caption} onChangeText={setCaption} multiline />

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

              <Row style={{ gap: space.sm, alignItems: 'flex-start' }}>
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
                <Card
                  style={{
                    backgroundColor: theme.accentSoft,
                    borderColor: theme.accentSoft,
                    padding: space.md,
                    gap: 2,
                  }}
                >
                  {pricePerKg > 0 ? (
                    <T size={15} weight="700" color={theme.accent}>
                      {p.perKg} · {p.perLb}
                    </T>
                  ) : null}
                  {lotKg > 0 ? (
                    <T size={13.5} color={theme.inkSoft}>
                      {weightParts(lotKg).kg} / {weightParts(lotKg).lb}
                      {pricePerKg > 0 ? ` · ${money(pricePerKg * lotKg)}` : ''}
                    </T>
                  ) : null}
                </Card>
              ) : null}

              <Checkbox
                checked={shippingIncluded}
                onToggle={() => setShippingIncluded((v) => !v)}
                label="Shipping included"
              />
            </>
          ) : null}
        </Card>

        <Row style={{ gap: space.sm }}>
          <Btn title="Cancel" kind="ghost" onPress={() => router.back()} style={{ flex: 1 }} />
          <Btn title="Post" onPress={submit} disabled={!ready} style={{ flex: 2 }} />
        </Row>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
