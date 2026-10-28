import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Header } from '../src/components/Header';
import { PhotoPicker } from '../src/components/PhotoPicker';
import { Btn, Field, Label, T } from '../src/components/ui';
import { uploadPhoto } from '../src/lib/supabase';
import { useStore } from '../src/store';
import { space, theme, track } from '../src/theme';
import { Lang, supplierName, useLang } from '../src/i18n';
import { SUPPLIER_TYPES, SupplierType } from '../src/types';

type Choice = SupplierType | 'none';

const options = (lang: Lang): { value: Choice; label: string }[] => [
  { value: 'none', label: 'Not selling' },
  ...SUPPLIER_TYPES.map((t) => ({ value: t, label: supplierName(t, lang) })),
];

export default function EditProfile() {
  const router = useRouter();
  const { me, updateMe } = useStore();
  const { lang } = useLang();
  const OPTIONS = options(lang);

  const [name, setName] = useState(me?.name ?? '');
  const [bio, setBio] = useState(me?.bio ?? '');
  const [avatar, setAvatar] = useState<string[]>(me?.avatar ? [me.avatar] : []);
  const [choice, setChoice] = useState<Choice>(me?.role === 'supplier' ? (me.supplierType ?? 'farmer') : 'none');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // The screen stays mounted, so re-read the account every time it is opened.
  useFocusEffect(
    useCallback(() => {
      setName(me?.name ?? '');
      setBio(me?.bio ?? '');
      setAvatar(me?.avatar ? [me.avatar] : []);
      setChoice(me?.role === 'supplier' ? (me.supplierType ?? 'farmer') : 'none');
      setOpen(false);
    }, [me?.id, me?.name, me?.bio, me?.avatar, me?.role, me?.supplierType])
  );

  if (!me) return null;

  const save = async () => {
    if (!me) return;
    setBusy(true);
    try {
      const avatarUrl = avatar[0] ? await uploadPhoto(avatar[0], me.id) : undefined;
      await updateMe({
        name: name.trim(),
        bio,
        avatar: avatarUrl,
        role: choice === 'none' ? 'customer' : 'supplier',
        supplierType: choice === 'none' ? undefined : choice,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Could not save', err?.message ?? 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const current = OPTIONS.find((o) => o.value === choice)!;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header back title="Edit profile" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.xl }}
        keyboardShouldPersistTaps="handled"
      >
        <PhotoPicker photos={avatar} onChange={setAvatar} max={1} label="Picture" />

        <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />

        <Field label="Bio" value={bio} onChangeText={setBio} multiline placeholder="Anything you like" />

        <View style={{ gap: space.sm }}>
          <Label>Supplying</Label>
          <Pressable
            onPress={() => setOpen((v) => !v)}
            style={{
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: theme.ink,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <T size={15} weight="300">
              {current.label}
            </T>
            <T size={10} color={theme.muted}>
              {open ? '▲' : '▼'}
            </T>
          </Pressable>

          {open ? (
            <View style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: theme.line }}>
              {OPTIONS.map((o, i) => (
                <Pressable
                  key={o.value}
                  onPress={() => {
                    setChoice(o.value);
                    setOpen(false);
                  }}
                  style={{
                    paddingVertical: 13,
                    paddingHorizontal: space.md,
                    borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                    borderTopColor: theme.lineSoft,
                  }}
                >
                  <T
                    size={11}
                    weight={o.value === choice ? '600' : '400'}
                    style={{ letterSpacing: track.button, textTransform: 'uppercase' }}
                  >
                    {o.label}
                  </T>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View style={{ gap: space.md }}>
          <Btn title="Save" onPress={save} busy={busy} />
          <Btn title="Cancel" kind="text" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
