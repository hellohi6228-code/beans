import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Header } from '../src/components/Header';
import { PhotoPicker } from '../src/components/PhotoPicker';
import { Btn, Card, Checkbox, Divider, Field, Label, Row, Segmented, Sub, T } from '../src/components/ui';
import { useStore } from '../src/store';
import { space, theme } from '../src/theme';
import { KG_PER_LB, Unit, money, priceParts, toKg, weightParts } from '../src/units';

export default function NewListing() {
  const router = useRouter();
  const { addListing, me } = useStore();

  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState<Unit>('kg');
  const [price, setPrice] = useState('');
  const [lot, setLot] = useState('');
  const [shippingIncluded, setShippingIncluded] = useState(false);
  const [origin, setOrigin] = useState('');
  const [process, setProcess] = useState('');
  const [roast, setRoast] = useState('Green');
  const [description, setDescription] = useState('');

  const priceNum = parseFloat(price.replace(',', '.'));
  const lotNum = parseFloat(lot.replace(',', '.'));
  const pricePerKg = isFinite(priceNum) && priceNum > 0 ? (unit === 'kg' ? priceNum : priceNum / KG_PER_LB) : 0;
  const lotKg = isFinite(lotNum) && lotNum > 0 ? toKg(lotNum, unit) : 0;

  const ready = photos.length >= 1 && title.trim().length > 2 && pricePerKg > 0 && lotKg > 0;

  const submit = () => {
    addListing({
      title: title.trim(),
      photos,
      pricePerKg,
      lotKg,
      enteredUnit: unit,
      shippingIncluded,
      origin: origin.trim() || 'Unspecified',
      process: process.trim() || 'Unspecified',
      roast: roast.trim() || 'Green',
      description: description.trim(),
    });
    router.back();
  };

  if (me?.role !== 'supplier') {
    return <Header back title="Only suppliers can list beans" />;
  }

  const p = priceBothPreview(pricePerKg);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header back title="New listing" subtitle="One price, kg and lb, shipping stated up front" />

      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: space.md, paddingBottom: space.xxl }}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <PhotoPicker
            photos={photos}
            onChange={setPhotos}
            max={3}
            label="Pictures of the beans"
            hint="One to three. Take them now or upload from your phone."
          />
        </Card>

        <Card style={{ gap: space.lg }}>
          <Field
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Gesha, washed — Lot 14"
          />

          <View style={{ gap: space.sm }}>
            <Label>Enter your numbers in</Label>
            <Segmented
              value={unit}
              onChange={setUnit}
              options={[
                { value: 'kg', label: 'Kilograms' },
                { value: 'lb', label: 'Pounds' },
              ]}
            />
            <Sub>Buyers always see both. Type in whichever you use.</Sub>
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
              label={`Lot size (${unit})`}
              value={lot}
              onChangeText={setLot}
              keyboardType="decimal-pad"
              placeholder="0"
              style={{ flex: 1 }}
            />
          </Row>

          {pricePerKg > 0 || lotKg > 0 ? (
            <Card style={{ backgroundColor: theme.accentSoft, borderColor: theme.accentSoft, padding: space.md, gap: 4 }}>
              <Label>Buyers will see</Label>
              {pricePerKg > 0 ? (
                <T size={15} weight="700" color={theme.accent}>
                  {p.perKg} · {p.perLb}
                </T>
              ) : null}
              {lotKg > 0 ? (
                <T size={13.5} color={theme.inkSoft}>
                  Lot {weightParts(lotKg).kg} / {weightParts(lotKg).lb}
                  {pricePerKg > 0 ? ` · whole lot ${money(pricePerKg * lotKg)}` : ''}
                </T>
              ) : null}
            </Card>
          ) : null}

          <Divider />

          <Checkbox
            checked={shippingIncluded}
            onToggle={() => setShippingIncluded((v) => !v)}
            label="Shipping included in this price"
            sublabel="US shipping. Leave unticked if the buyer arranges freight."
          />

          <Card style={{ backgroundColor: theme.warnSoft, borderColor: theme.warnSoft, padding: space.md }}>
            <T size={13} weight="700" color={theme.warn}>
              Zero-tolerance price policy
            </T>
            <T size={12.5} color={theme.inkSoft} style={{ marginTop: 2, lineHeight: 18 }}>
              What you type here is the total a buyer pays on Beans — processing, banking and tax included. Asking for
              a different number once they are in the chat is a reportable discrepancy.
            </T>
          </Card>
        </Card>

        <Card style={{ gap: space.lg }}>
          <Row style={{ gap: space.sm, alignItems: 'flex-start' }}>
            <Field label="Origin" value={origin} onChangeText={setOrigin} placeholder="Colombia" style={{ flex: 1 }} />
            <Field label="Process" value={process} onChangeText={setProcess} placeholder="Washed" style={{ flex: 1 }} />
          </Row>
          <Field label="Roast" value={roast} onChangeText={setRoast} placeholder="Green / Light / Medium" />
          <Field
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="Altitude, harvest, cup notes, moisture, anything a buyer should know."
          />
        </Card>

        <Row style={{ gap: space.sm }}>
          <Btn title="Cancel" kind="ghost" onPress={() => router.back()} style={{ flex: 1 }} />
          <Btn title="Publish listing" onPress={submit} disabled={!ready} style={{ flex: 2 }} />
        </Row>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const priceBothPreview = (pricePerKg: number) => priceParts(pricePerKg);
