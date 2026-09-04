import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert, Pressable, View } from 'react-native';
import { radius, space, theme } from '../theme';
import { Btn, Label, Photo, Row, T } from './ui';

/**
 * One to three pictures per listing or post, taken with the camera or picked
 * from the phone's library.
 */
export function PhotoPicker({
  photos,
  onChange,
  max = 3,
  label = 'Photos',
  hint,
}: {
  photos: string[];
  onChange: (next: string[]) => void;
  max?: number;
  label?: string;
  hint?: string;
}) {
  const full = photos.length >= max;

  const add = (uri: string) => onChange([...photos, uri].slice(0, max));

  const shoot = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Camera access needed', 'Allow camera access in Settings to photograph your beans.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) add(result.assets[0].uri);
  };

  const upload = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Photo access needed', 'Allow photo access in Settings to upload pictures.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: max - photos.length > 1,
      selectionLimit: max - photos.length,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) {
      onChange([...photos, ...result.assets.map((a) => a.uri)].slice(0, max));
    }
  };

  return (
    <View style={{ gap: space.sm }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label>{label}</Label>
        <T size={12} color={theme.muted}>
          {photos.length}/{max}
        </T>
      </Row>

      <Row style={{ gap: space.sm }}>
        {photos.map((uri, i) => (
          <View key={uri + i}>
            <Photo uri={uri} style={{ width: 86, height: 86 }} />
            <Pressable
              onPress={() => onChange(photos.filter((_, idx) => idx !== i))}
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: theme.ink,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <T size={13} weight="700" color="#fff">
                ×
              </T>
            </Pressable>
          </View>
        ))}
        {!full ? (
          <View
            style={{
              width: 86,
              height: 86,
              borderRadius: radius.md,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: theme.muted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <T size={22} color={theme.muted}>
              +
            </T>
          </View>
        ) : null}
      </Row>

      <Row style={{ gap: space.sm }}>
        <Btn title="Take photo" kind="soft" onPress={shoot} disabled={full} style={{ flex: 1, height: 44 }} />
        <Btn title="Upload" kind="ghost" onPress={upload} disabled={full} style={{ flex: 1, height: 44 }} />
      </Row>

      {hint ? (
        <T size={12} color={theme.muted}>
          {hint}
        </T>
      ) : null}
    </View>
  );
}
