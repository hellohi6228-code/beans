import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Header } from '../src/components/Header';
import { Btn, Card, Field, Label, Row, Sub, T } from '../src/components/ui';
import { PhotoPicker } from '../src/components/PhotoPicker';
import { useStore } from '../src/store';
import { space, theme } from '../src/theme';
import { Role, SUPPLIER_BLURB, SUPPLIER_LABEL, SupplierType } from '../src/types';

const TYPES: SupplierType[] = ['farmer', 'bulk', 'online_retail', 'coffee_shop'];

export default function Signup() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const role: Role = params.role === 'supplier' ? 'supplier' : 'customer';
  const { createAccount } = useStore();

  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [type, setType] = useState<SupplierType>('farmer');
  const [avatar, setAvatar] = useState<string[]>([]);

  const ready = name.trim().length > 1 && handle.trim().length > 1;

  const submit = () => {
    createAccount({
      role,
      name: name.trim(),
      handle: handle.trim().replace(/^@/, '').toLowerCase(),
      supplierType: role === 'supplier' ? type : undefined,
      avatar: avatar[0],
      bio: bio.trim(),
      location: location.trim(),
      website: website.trim() || undefined,
    });
    router.replace('/home');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header back title={role === 'supplier' ? 'Your business' : 'Your profile'} />

      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: space.lg, paddingBottom: space.xxl }}
        keyboardShouldPersistTaps="handled"
      >
        {role === 'supplier' ? (
          <Card style={{ gap: space.md }}>
            <Label>You are a</Label>
            <View style={{ gap: space.sm }}>
              {TYPES.map((t) => {
                const on = t === type;
                return (
                  <Card
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
                  </Card>
                );
              })}
            </View>
          </Card>
        ) : null}

        <Card style={{ gap: space.lg }}>
          <PhotoPicker
            photos={avatar}
            onChange={setAvatar}
            max={1}
            label="Profile picture"

          />

          <Field
            label={role === 'supplier' ? 'Business name' : 'Your name'}
            value={name}
            onChangeText={setName}
            placeholder={role === 'supplier' ? 'Finca La Colina' : 'Dana Whitlock'}
          />

          <Field
            label="Handle"
            value={handle}
            onChangeText={setHandle}
            autoCapitalize="none"
            placeholder="fincalacolina"
          />

          <Field
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder={role === 'supplier' ? 'Huila, Colombia' : 'Denver, CO'}
          />

          {role === 'supplier' ? (
            <Field label="Website" value={website} onChangeText={setWebsite} autoCapitalize="none" placeholder="optional" />
          ) : null}

          <Field
            label="Bio"
            value={bio}
            onChangeText={setBio}
            multiline
            placeholder="Anything you like"
          />
        </Card>

        <Row style={{ gap: space.sm }}>
          <Btn title="Back" kind="ghost" onPress={() => router.back()} style={{ flex: 1 }} />
          <Btn title="Create" onPress={submit} disabled={!ready} style={{ flex: 2 }} />
        </Row>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
