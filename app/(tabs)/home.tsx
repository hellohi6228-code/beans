import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Btn, Chip, Field, Label, Segmented, T } from '../../src/components/ui';
import { LangPicker } from '../../src/components/LangPicker';
import { categoryName, cuisineName, useLang } from '../../src/i18n';
import { INGREDIENTS, ingredientName } from '../../src/ingredients';
import { useStore } from '../../src/store';
import { space, theme, track } from '../../src/theme';
import { CATEGORIES, CUISINES, Category, Cuisine } from '../../src/types';
import { Unit, toKg, weightParts } from '../../src/units';

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, setRequest, me } = useStore();
  const { lang } = useLang();

  const [cuisine, setCuisine] = useState<Cuisine | 'all'>(state.request?.cuisine ?? 'all');
  const [ingredient, setIngredient] = useState<string | undefined>(state.request?.ingredient);
  const [category, setCategory] = useState<Category | 'all'>(state.request?.category ?? 'all');
  const [text, setText] = useState(state.request?.text ?? '');
  const [qty, setQty] = useState(state.request?.qty ? String(state.request.qty) : '');
  const [unit, setUnit] = useState<Unit | 'case'>(state.request?.unit ?? 'kg');

  if (!me) return null;

  // A tag belongs to one kitchen, so changing kitchen clears it.
  const pickCuisine = (c: Cuisine | 'all') => {
    setCuisine(c);
    setIngredient(undefined);
  };

  // The amount is optional: blank browses everything.
  const value = parseFloat(qty.replace(',', '.'));
  const hasQty = qty.trim().length > 0;
  const valid = isFinite(value) && value > 0;
  const qtyKg = valid && unit !== 'case' ? toKg(value, unit) : 0;
  const ready = !hasQty || valid;

  const search = () => {
    setRequest({
      text: text.trim(),
      category,
      cuisine,
      ingredient: cuisine === 'all' ? undefined : ingredient,
      qty: valid ? value : 0,
      unit,
      qtyKg,
    });
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
        <View style={{ alignItems: 'center', marginBottom: space.lg }}>
          <Image
            source={require('../../assets/logo-mark.png')}
            resizeMode="contain"
            style={{ width: 132, height: 132 }}
          />
        </View>

        <LangPicker />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -space.lg, marginTop: space.xl }}
          contentContainerStyle={{ gap: 6, paddingHorizontal: space.lg }}
        >
          <Chip label="All kitchens" selected={cuisine === 'all'} onPress={() => pickCuisine('all')} />
          {CUISINES.map((c) => (
            <Chip key={c} label={cuisineName(c, lang)} selected={cuisine === c} onPress={() => pickCuisine(c)} />
          ))}
        </ScrollView>

        {cuisine !== 'all' ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: space.md }}>
            {INGREDIENTS[cuisine].map((i) => (
              <Chip
                key={i.en}
                label={ingredientName(i, lang)}
                selected={ingredient === i.en}
                onPress={() => setIngredient((cur) => (cur === i.en ? undefined : i.en))}
              />
            ))}
          </View>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -space.lg, marginTop: 6 }}
          contentContainerStyle={{ gap: 6, paddingHorizontal: space.lg }}
        >
          <Chip label="All food" selected={category === 'all'} onPress={() => setCategory('all')} />
          {CATEGORIES.map((c) => (
            <Chip key={c} label={categoryName(c, lang)} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>

        <Field
          value={text}
          onChangeText={setText}
          placeholder={
            cuisine === 'all'
              ? 'Gochujang, 00 flour, masa, nước mắm…'
              : `${INGREDIENTS[cuisine]
                  .slice(0, 3)
                  .map((i) => ingredientName(i, lang))
                  .join(', ')}…`
          }
          returnKeyType="search"
          onSubmitEditing={ready ? search : undefined}
          style={{ marginTop: space.lg }}
        />

        <View style={{ marginTop: space.xl }}>
          <Label>How much</Label>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.lg, marginTop: space.md }}>
          <TextInput
            value={qty}
            onChangeText={setQty}
            keyboardType="decimal-pad"
            placeholder="Any"
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
          <View style={{ width: 150 }}>
            <Segmented
              value={unit}
              onChange={setUnit}
              options={[
                { value: 'kg', label: 'kg' },
                { value: 'lb', label: 'lb' },
                { value: 'case', label: 'case' },
              ]}
            />
          </View>
        </View>

        {valid ? (
          <T size={10} color={theme.muted} style={{ letterSpacing: track.label, marginTop: space.md }}>
            {unit === 'case'
              ? `${value} ${value === 1 ? 'CASE' : 'CASES'}`
              : `${weightParts(qtyKg).kg} / ${weightParts(qtyKg).lb}`}
          </T>
        ) : null}

        <Btn title="Find" onPress={search} disabled={!ready} style={{ marginTop: space.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
