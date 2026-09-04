import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Header } from '../src/components/Header';
import { PhotoPicker } from '../src/components/PhotoPicker';
import { Btn, Card, Field, Label, Row, Sub } from '../src/components/ui';
import { useStore } from '../src/store';
import { space, theme } from '../src/theme';
import { SUPPLIER_BLURB, SUPPLIER_LABEL, SupplierType } from '../src/types';
import { Card as C, T } from '../src/components/ui';

const TYPES: SupplierType[] = ['farmer', 'bulk', 'online_retail', 'coffee_shop'];

export default function EditProfile() {
  const router = useRouter();
  const { me, updateMe } = useStore();

  const [name, setName] = useState(me?.name ?? '');
  const [handle, setHandle] = useState(me?.handle ?? '');
  const [location, setLocation] = useState(me?.location ?? '');
  const [website, setWebsite] = useState(me?.website ?? '');
  const [bio, setBio] = useState(me?.bio ?? '');
  const [avatar, setAvatar] = useState<string[]>(me?.avatar ? [me.avatar] : []);
  const [type, setType] = useState<SupplierType>(me?.supplierType ?? 'farmer');

  if (!me) return <Header back title="Not signed in" />;
  const isSupplier = me.role === 'supplier';

  const save = () => {
    updateMe({
      name: name.trim(),
      handle: handle.trim().replace(/^@/, '').toLowerCase(),
      location: location.trim(),
      website: website.trim() || undefined,
      bio,
      avatar: avatar[0],
      supplierType: isSupplier ? type : undefined,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header back title="Edit profile" />

      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: space.md, paddingBottom: space.xxl }}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={{ gap: space.lg }}>
          <PhotoPicker photos={avatar} onChange={setAvatar} max={1} label="Profile picture" />

          <Field label={isSupplier ? 'Business name' : 'Name'} value={name} onChangeText={setName} />
          <Field label="Handle" value={handle} onChangeText={setHandle} autoCapitalize="none" />
          <Field label="Location" value={location} onChangeText={setLocation} />
          {isSupplier ? (
            <Field label="Website" value={website} onChangeText={setWebsite} autoCapitalize="none" />
          ) : null}

          <View style={{ gap: space.xs }}>
            <Field
              label="Bio"
              value={bio}
              onChangeText={setBio}
              multiline
              placeholder="Write anything you like under your name."
            />
            <Sub>Line breaks are kept exactly as you type them.</Sub>
          </View>
        </Card>

        {isSupplier ? (
          <Card style={{ gap: space.sm }}>
            <Label>Kind of supplier</Label>
            {TYPES.map((t) => {
              const on = t === type;
              return (
                <C
                  key={t}
                  onPress={() => setType(t)}
                  style={{
                    padding: space.md,
                    backgroundColor: on ? theme.accentSoft : theme.cardSolid,
                    borderColor: on ? theme.accent : theme.line,
                  }}
                >
                  <T size={15} weight="700" color={on ? theme.accent : theme.ink}>
                    {SUPPLIER_LABEL[t]}
                  </T>
                  <T size={12.5} color={theme.muted}>
                    {SUPPLIER_BLURB[t]}
                  </T>
                </C>
              );
            })}
          </Card>
        ) : null}

        <Row style={{ gap: space.sm }}>
          <Btn title="Cancel" kind="ghost" onPress={() => router.back()} style={{ flex: 1 }} />
          <Btn title="Save" onPress={save} style={{ flex: 2 }} />
        </Row>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
