import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Header } from '../src/components/Header';
import { PhotoPicker } from '../src/components/PhotoPicker';
import { Btn, Card, Field, Label, Row, T } from '../src/components/ui';
import { useStore } from '../src/store';
import { radius, space, theme } from '../src/theme';
import { SUPPLIER_LABEL, SupplierType } from '../src/types';

type Choice = SupplierType | 'none';

const OPTIONS: { value: Choice; label: string }[] = [
  { value: 'none', label: 'Not selling' },
  { value: 'farmer', label: SUPPLIER_LABEL.farmer },
  { value: 'bulk', label: SUPPLIER_LABEL.bulk },
  { value: 'online_retail', label: SUPPLIER_LABEL.online_retail },
  { value: 'coffee_shop', label: SUPPLIER_LABEL.coffee_shop },
];

export default function EditProfile() {
  const router = useRouter();
  const { me, updateMe } = useStore();

  const [name, setName] = useState(me?.name ?? '');
  const [bio, setBio] = useState(me?.bio ?? '');
  const [avatar, setAvatar] = useState<string[]>(me?.avatar ? [me.avatar] : []);
  const [choice, setChoice] = useState<Choice>(
    me?.role === 'supplier' ? (me.supplierType ?? 'farmer') : 'none'
  );
  const [open, setOpen] = useState(false);

  if (!me) return null;

  const save = () => {
    updateMe({
      name: name.trim(),
      bio,
      avatar: avatar[0],
      role: choice === 'none' ? 'customer' : 'supplier',
      supplierType: choice === 'none' ? undefined : choice,
    });
    router.back();
  };

  const current = OPTIONS.find((o) => o.value === choice)!;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header back title="Edit profile" />

      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: space.lg }}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={{ gap: space.lg }}>
          <PhotoPicker photos={avatar} onChange={setAvatar} max={1} label="Picture" />

          <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />

          <Field label="Bio" value={bio} onChangeText={setBio} multiline placeholder="Anything you like" />

          {/* Dropdown: are you selling, and as what */}
          <View style={{ gap: space.xs }}>
            <Label>Supplying</Label>
            <Pressable
              onPress={() => setOpen((v) => !v)}
              style={{
                height: 50,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: theme.line,
                backgroundColor: theme.cardSolid,
                paddingHorizontal: space.md,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <T size={16}>{current.label}</T>
              <T size={13} color={theme.muted}>
                {open ? '▲' : '▼'}
              </T>
            </Pressable>

            {open ? (
              <Card style={{ padding: 4, gap: 0 }}>
                {OPTIONS.map((o) => (
                  <Pressable
                    key={o.value}
                    onPress={() => {
                      setChoice(o.value);
                      setOpen(false);
                    }}
                    style={{ paddingVertical: 12, paddingHorizontal: space.md, borderRadius: radius.sm }}
                  >
                    <T size={15} weight={o.value === choice ? '700' : '500'} color={o.value === choice ? theme.accent : theme.ink}>
                      {o.label}
                    </T>
                  </Pressable>
                ))}
              </Card>
            ) : null}
          </View>
        </Card>

        <Row style={{ gap: space.sm }}>
          <Btn title="Cancel" kind="ghost" onPress={() => router.back()} style={{ flex: 1 }} />
          <Btn title="Save" onPress={save} style={{ flex: 2 }} />
        </Row>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
