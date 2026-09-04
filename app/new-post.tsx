import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Header } from '../src/components/Header';
import { PhotoPicker } from '../src/components/PhotoPicker';
import { Btn, Card, Checkbox, Field, Row } from '../src/components/ui';
import { useStore } from '../src/store';
import { space } from '../src/theme';

export default function NewPost() {
  const router = useRouter();
  const { addPost } = useStore();

  const [photos, setPhotos] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [contactable, setContactable] = useState(false);

  const ready = photos.length >= 1;

  const submit = () => {
    addPost({ photos, caption: caption.trim(), contactable });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header back title="New post" />

      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: space.md }}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <PhotoPicker photos={photos} onChange={setPhotos} max={3} label="Photos" />
        </Card>

        <Card style={{ gap: space.lg }}>
          <Field label="Caption" value={caption} onChangeText={setCaption} multiline />

          <Checkbox
            checked={contactable}
            onToggle={() => setContactable((v) => !v)}
            label="Something you sell, or an event?"
          />
        </Card>

        <Row style={{ gap: space.sm }}>
          <Btn title="Cancel" kind="ghost" onPress={() => router.back()} style={{ flex: 1 }} />
          <Btn title="Post" onPress={submit} disabled={!ready} style={{ flex: 2 }} />
        </Row>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
