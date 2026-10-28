import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LangPicker } from '../../src/components/LangPicker';
import { ListingGrid } from '../../src/components/ListingGrid';
import { TagTree } from '../../src/components/TagTree';
import { Chip, Field, Label, Row, Segmented, T } from '../../src/components/ui';
import { caseKg } from '../../src/listing';
import { matches, queryTerms, searchText } from '../../src/search';
import { useStore } from '../../src/store';
import { tagsMatch } from '../../src/tags';
import { space, theme, track } from '../../src/theme';
import { Post } from '../../src/types';
import { Unit, toKg, weightParts } from '../../src/units';

type AmountUnit = Unit | 'case';

/** Whether a listing can fill the amount asked for — enough stock, and not under its minimum. */
function fits(p: Post, qty: number, unit: AmountUnit) {
  const l = p.listing!;
  if (!qty) return true;
  if (unit === 'case') {
    return l.sellBy === 'case' && (l.casesAvailable ?? 0) >= qty && l.minOrder <= qty;
  }
  const qtyKg = toKg(qty, unit);
  const minKg = l.sellBy === 'case' ? l.minOrder * caseKg(l) : l.minOrder;
  return l.lotKg >= qtyKg && minKg <= qtyKg;
}

/** Buyers' front page: pick what you need and the listings show up underneath. */
export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, me, livesNow, userById } = useStore();

  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [text, setText] = useState('');
  const [amountOpen, setAmountOpen] = useState(false);
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState<AmountUnit>('kg');
  const [usOnly, setUsOnly] = useState(false);

  const value = parseFloat(qty.replace(',', '.'));
  const amount = amountOpen && isFinite(value) && value > 0 ? value : 0;

  const toggle = (id: string) =>
    setPicked((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const shown = useMemo(() => {
    const terms = queryTerms(text);
    return state.posts
      .filter((p) => p.listing?.active && p.userId !== me?.id)
      .filter((p) => tagsMatch(picked, p.listing!.ingredients, p.listing!.cuisines))
      .filter((p) => !usOnly || p.listing!.shipsFrom === 'us')
      .filter((p) => !terms.length || matches(terms, searchText(p.caption, p.listing!)))
      .filter((p) => fits(p, amount, unit))
      .sort((a, b) => a.listing!.pricePerKg - b.listing!.pricePerKg);
  }, [state.posts, me, picked, usOnly, text, amount, unit]);

  if (!me) return null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ paddingTop: space.xl, paddingHorizontal: space.lg, paddingBottom: insets.bottom + 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', marginBottom: space.lg }}>
          <Image source={require('../../assets/logo-mark.png')} resizeMode="contain" style={{ width: 96, height: 96 }} />
        </View>

        <LangPicker />

        <Field
          value={text}
          onChangeText={setText}
          placeholder="Gochujang, 00 flour, masa, nước mắm…"
          returnKeyType="search"
          style={{ marginTop: space.lg }}
        />

        {livesNow.length ? (
          <View style={{ marginTop: space.lg, gap: space.sm }}>
            <Label>Live now</Label>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {livesNow.map((l) => (
                <Pressable
                  key={l.id}
                  onPress={() => router.push(`/live/${l.id}`)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 10, backgroundColor: theme.ink }}
                >
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#e5484d' }} />
                  <T size={10} weight="500" color="#fff" style={{ letterSpacing: track.label, textTransform: 'uppercase' }}>
                    {userById(l.sellerId)?.name || 'Seller'}
                    {l.title ? ` · ${l.title}` : ''}
                  </T>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <Row style={{ marginTop: space.xl, marginBottom: space.sm, justifyContent: 'space-between' }}>
          <Pressable onPress={() => setPicked(new Set())} hitSlop={8}>
            <T
              size={10}
              weight={picked.size ? '400' : '600'}
              color={picked.size ? theme.muted : theme.ink}
              style={{ letterSpacing: track.label, textTransform: 'uppercase' }}
            >
              All cuisines
            </T>
          </Pressable>
          {picked.size ? (
            <Pressable onPress={() => setPicked(new Set())} hitSlop={8}>
              <T size={10} color={theme.muted} style={{ letterSpacing: track.label, textTransform: 'uppercase' }}>
                Clear {picked.size}
              </T>
            </Pressable>
          ) : null}
        </Row>

        <TagTree selected={picked} onToggle={toggle} />

        <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.lineSoft }}>
          <Pressable
            onPress={() => setAmountOpen((v) => !v)}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}
          >
            <T size={11.5} weight={amount ? '600' : '500'} style={{ letterSpacing: track.label, textTransform: 'uppercase' }}>
              Amount
              {amount ? ` · ${unit === 'case' ? `${amount} ${amount === 1 ? 'box' : 'boxes'}` : `${weightParts(toKg(amount, unit)).kg} / ${weightParts(toKg(amount, unit)).lb}`}` : ''}
            </T>
            <T size={16} weight="300" color={theme.muted} style={{ transform: [{ rotate: amountOpen ? '90deg' : '0deg' }] }}>
              ›
            </T>
          </Pressable>
          {amountOpen ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.lg, paddingBottom: space.lg }}>
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
                  fontSize: 30,
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
                    { value: 'case', label: 'box' },
                  ]}
                />
              </View>
            </View>
          ) : null}
        </View>

        <Row style={{ marginTop: space.md, marginBottom: space.lg, justifyContent: 'space-between' }}>
          <Chip label="US stock only" selected={usOnly} onPress={() => setUsOnly((v) => !v)} />
          <T size={10} color={theme.muted} style={{ letterSpacing: track.label, textTransform: 'uppercase' }}>
            {shown.length} {shown.length === 1 ? 'listing' : 'listings'}
          </T>
        </Row>

        <ListingGrid posts={shown} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
