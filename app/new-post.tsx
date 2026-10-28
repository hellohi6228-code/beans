import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Header } from '../src/components/Header';
import { PhotoPicker } from '../src/components/PhotoPicker';
import { Btn, Checkbox, Chip, Field, Label, Row, Rule, Segmented, T } from '../src/components/ui';
import { uploadPhotos } from '../src/lib/supabase';
import { useStore } from '../src/store';
import { space, theme, track } from '../src/theme';
import { TagTree } from '../src/components/TagTree';
import { allergenName, en, originName, pair, useLang, words } from '../src/i18n';
import { dutiesLine } from '../src/listing';
import { cuisinesOf } from '../src/tags';
import { ALLERGENS, Allergen, ListingPart, ORIGINS, Origin } from '../src/types';
import {
  KG_PER_LB,
  Unit,
  gToKg,
  money,
  ozToKg,
  priceParts,
  smallWeightParts,
  toKg,
  weightParts,
} from '../src/units';

const n = (s: string) => {
  const v = parseFloat(s.replace(',', '.'));
  return isFinite(v) && v > 0 ? v : 0;
};

export default function NewPost() {
  const router = useRouter();
  const { addPost, me } = useStore();
  const { lang } = useLang();

  const [photos, setPhotos] = useState<string[]>([]);
  const [caption, setCaption] = useState('');

  // A seller's post is a listing unless they untick it.
  const [selling, setSelling] = useState(me?.role === 'supplier');
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [sellBy, setSellBy] = useState<'weight' | 'case'>('weight');
  const [unit, setUnit] = useState<Unit>('kg');

  // By weight
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  // By the box
  const [casePrice, setCasePrice] = useState('');
  const [perCase, setPerCase] = useState('');
  const [unitSize, setUnitSize] = useState('');
  const [cases, setCases] = useState('');

  const [minOrder, setMinOrder] = useState('');
  const [shipsFrom, setShipsFrom] = useState<'us' | Origin>(me?.shipsFrom ?? 'us');
  const [leadDays, setLeadDays] = useState('');
  const [fdaRegistered, setFdaRegistered] = useState(false);
  const [englishLabel, setEnglishLabel] = useState(false);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [busy, setBusy] = useState(false);

  // Unit sizes are small, so a kg seller types grams and a lb seller ounces.
  const unitKg = unit === 'kg' ? gToKg(n(unitSize)) : ozToKg(n(unitSize));
  const unitsPerCase = Math.round(n(perCase));
  const oneCaseKg = unitsPerCase * unitKg;
  const casesAvailable = Math.round(n(cases));

  const pricePerKg =
    sellBy === 'case'
      ? oneCaseKg > 0
        ? n(casePrice) / oneCaseKg
        : 0
      : unit === 'kg'
        ? n(price)
        : n(price) / KG_PER_LB;
  const lotKg = sellBy === 'case' ? casesAvailable * oneCaseKg : toKg(n(amount), unit);
  const minOrderValue = sellBy === 'case' ? Math.round(n(minOrder)) : toKg(n(minOrder), unit);

  const listingReady =
    tags.size > 0 &&
    pricePerKg > 0 &&
    lotKg > 0 &&
    (sellBy === 'weight' || (n(casePrice) > 0 && unitsPerCase > 0 && unitKg > 0 && casesAvailable > 0)) &&
    (shipsFrom === 'us' || n(leadDays) > 0);

  const ready = photos.length >= 1 && (!selling || listingReady) && !!me;

  const toggleAllergen = (a: Allergen) =>
    setAllergens((list) => (list.includes(a) ? list.filter((x) => x !== a) : [...list, a]));
  const toggleTag = (id: string) =>
    setTags((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const submit = async () => {
    if (!me) return;
    setBusy(true);
    try {
      const listing: ListingPart | undefined =
        selling && tags.size
          ? {
              ingredients: [...tags],
              sellBy,
              pricePerKg,
              lotKg,
              enteredUnit: unit,
              ...(sellBy === 'case'
                ? { pricePerCase: n(casePrice), unitsPerCase, unitKg, casesAvailable }
                : {}),
              minOrder: minOrderValue,
              cuisines: cuisinesOf([...tags]),
              shipsFrom,
              leadDays: shipsFrom !== 'us' ? Math.round(n(leadDays)) : undefined,
              fdaRegistered,
              englishLabel,
              allergens,
              active: true,
            }
          : undefined;

      const uploaded = await uploadPhotos(photos, me.id);
      await addPost({ photos: uploaded, caption: caption.trim(), listing });
      router.back();
    } catch (err: any) {
      Alert.alert('Could not post', err?.message ?? 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const p = priceParts(pricePerKg);
  const small = unit === 'kg' ? 'g' : 'oz';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header back title="New post" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.xl }}
        keyboardShouldPersistTaps="handled"
      >
        <PhotoPicker photos={photos} onChange={setPhotos} max={3} />

        <Field label="Caption" value={caption} onChangeText={setCaption} multiline />

        {/* Only sellers list things; buyers just post. */}
        {me?.role === 'supplier' ? (
        <View>
          <Rule />
          <View style={{ paddingTop: space.lg, gap: space.lg }}>
            <Checkbox checked={selling} onToggle={() => setSelling((v) => !v)} label="Selling this" />

            {selling ? (
              <>
                <View style={{ gap: space.sm }}>
                  <Label>What it is{tags.size ? ` · ${tags.size}` : ''}</Label>
                  <T size={11} color={theme.muted} style={{ lineHeight: 16 }}>
                    Open a cuisine, then an ingredient, and tick what you sell. Buyers who tick the same find you.
                  </T>
                  <TagTree selected={tags} onToggle={toggleTag} itemsOnly />
                </View>

                <View style={{ gap: space.sm }}>
                  <Label>Sold by</Label>
                  <Segmented
                    value={sellBy}
                    onChange={setSellBy}
                    options={[
                      { value: 'weight', label: 'Weight' },
                      { value: 'case', label: 'Box' },
                    ]}
                  />
                </View>

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

                {sellBy === 'weight' ? (
                  <>
                    <Row style={{ gap: space.lg, alignItems: 'flex-start' }}>
                      <Field
                        label={`Price per ${unit} (USD)`}
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
                    <Field
                      label={`Min order (${unit})`}
                      value={minOrder}
                      onChangeText={setMinOrder}
                      keyboardType="decimal-pad"
                      placeholder="None"
                    />
                  </>
                ) : (
                  <>
                    <Row style={{ gap: space.lg, alignItems: 'flex-start' }}>
                      <Field
                        label="Units per box"
                        value={perCase}
                        onChangeText={setPerCase}
                        keyboardType="number-pad"
                        placeholder="24"
                        style={{ flex: 1 }}
                      />
                      <Field
                        label={`Unit size (${small})`}
                        value={unitSize}
                        onChangeText={setUnitSize}
                        keyboardType="decimal-pad"
                        placeholder={small === 'g' ? '200' : '7'}
                        style={{ flex: 1 }}
                      />
                    </Row>
                    <Row style={{ gap: space.lg, alignItems: 'flex-start' }}>
                      <Field
                        label="Price per box (USD)"
                        value={casePrice}
                        onChangeText={setCasePrice}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        style={{ flex: 1 }}
                      />
                      <Field
                        label="Boxes in stock"
                        value={cases}
                        onChangeText={setCases}
                        keyboardType="number-pad"
                        placeholder="0"
                        style={{ flex: 1 }}
                      />
                    </Row>
                    <Field
                      label="Min order (boxes)"
                      value={minOrder}
                      onChangeText={setMinOrder}
                      keyboardType="number-pad"
                      placeholder="None"
                    />
                  </>
                )}

                {pricePerKg > 0 || lotKg > 0 ? (
                  <View style={{ gap: 3 }}>
                    {sellBy === 'case' && unitsPerCase > 0 && unitKg > 0 ? (
                      <T size={10} color={theme.muted} style={{ letterSpacing: track.label }}>
                        {unitsPerCase} × {smallWeightParts(unitKg).g} / {smallWeightParts(unitKg).oz} ·{' '}
                        {weightParts(oneCaseKg).kg} / {weightParts(oneCaseKg).lb} a box
                      </T>
                    ) : null}
                    {pricePerKg > 0 ? (
                      <T size={13} weight="400">
                        {p.perKg} · {p.perLb}
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

                <View style={{ gap: space.sm }}>
                  <Label>Ships from</Label>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    <Chip
                      label={pair(en.usStock, words(lang)?.usStock)}
                      selected={shipsFrom === 'us'}
                      onPress={() => setShipsFrom('us')}
                    />
                    {ORIGINS.map((o) => (
                      <Chip key={o} label={originName(o, lang)} selected={shipsFrom === o} onPress={() => setShipsFrom(o)} />
                    ))}
                  </View>
                </View>

                {shipsFrom !== 'us' ? (
                  <Field
                    label="Days to reach a US buyer"
                    value={leadDays}
                    onChangeText={setLeadDays}
                    keyboardType="number-pad"
                    placeholder="30"
                  />
                ) : null}

                <Checkbox
                  checked={fdaRegistered}
                  onToggle={() => setFdaRegistered((v) => !v)}
                  label="FDA registered facility"
                />
                <Checkbox checked={englishLabel} onToggle={() => setEnglishLabel((v) => !v)} label="English label" />

                <View style={{ gap: space.sm }}>
                  <Label>Contains</Label>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {ALLERGENS.map((a) => (
                      <Chip
                        key={a}
                        label={allergenName(a, lang)}
                        selected={allergens.includes(a)}
                        onPress={() => toggleAllergen(a)}
                      />
                    ))}
                  </View>
                </View>

                <T size={11} color={theme.muted} style={{ lineHeight: 16 }}>
                  {dutiesLine(lang)}
                </T>
              </>
            ) : null}
          </View>
        </View>
        ) : null}

        <View style={{ gap: space.md }}>
          <Btn title="Post" onPress={submit} disabled={!ready} busy={busy} />
          <Btn title="Cancel" kind="text" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
