import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Header } from '../src/components/Header';
import { PhotoPicker } from '../src/components/PhotoPicker';
import { Btn, Card, Field, Label, Row, Segmented } from '../src/components/ui';
import { useStore } from '../src/store';
import { space } from '../src/theme';
import { Post } from '../src/types';

export default function NewPost() {
  const router = useRouter();
  const { addPost, me } = useStore();

  const [photos, setPhotos] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [kind, setKind] = useState<Post['kind']>('update');

  const ready = photos.length >= 1 || caption.trim().length > 2;

  const submit = () => {
    addPost({ photos, caption: caption.trim(), kind });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header back title="New post" subtitle={me?.name} />

      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: space.md }}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <PhotoPicker photos={photos} onChange={setPhotos} max={3} hint="Up to three pictures." />
        </Card>

        <Card style={{ gap: space.lg }}>
          <View style={{ gap: space.sm }}>
            <Label>What is this</Label>
            <Segmented
              value={kind}
              onChange={setKind}
              options={[
                { value: 'update', label: 'Update' },
                { value: 'merchandise', label: 'Merch' },
                { value: 'event', label: 'Event' },
              ]}
            />
          </View>

          <Field
            label="Caption"
            value={caption}
            onChangeText={setCaption}
            multiline
            placeholder="Say something about it."
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
