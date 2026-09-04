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
      <Header back title={role === 'supplier' ? 'Set up your business' : 'Set up your profile'} />

      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: space.lg, paddingBottom: space.xxl }}
        keyboardShouldPersistTaps="handled"
      >
        {role === 'supplier' ? (
          <Card style={{ gap: space.md }}>
            <Label>What kind of supplier are you</Label>
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
            hint="Optional. You can add it later."
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
            placeholder={
              role === 'supplier'
                ? 'Anything you want buyers to know about your business.'
                : 'What you brew, what you are looking for.'
            }
          />
        </Card>

        {role === 'supplier' ? (
          <Card style={{ backgroundColor: theme.warnSoft, borderColor: theme.warnSoft, gap: space.xs }}>
            <T size={14} weight="700" color={theme.warn}>
              One price, no surprises
            </T>
            <Sub>
              The price you put on a listing is the whole price a buyer pays here — processing, banking and tax
              included. Shipping is included only if you say so on the listing. Asking for more after the fact is a
              reportable price discrepancy, and Beans has a zero-tolerance policy.
            </Sub>
          </Card>
        ) : null}

        <Row style={{ gap: space.sm }}>
          <Btn title="Back" kind="ghost" onPress={() => router.back()} style={{ flex: 1 }} />
          <Btn title="Create account" onPress={submit} disabled={!ready} style={{ flex: 2 }} />
        </Row>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
