import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, View } from 'react-native';
import { radius, shadow, space, theme } from '../theme';
import { Label, Photo, T } from './ui';

/**
 * Three boxes. Tap an empty one and it asks: take a picture, or upload one.
 */
export function PhotoPicker({
  photos,
  onChange,
  max = 3,
  label,
}: {
  photos: string[];
  onChange: (next: string[]) => void;
  max?: number;
  label?: string;
}) {
  const [asking, setAsking] = useState(false);

  const add = (uris: string[]) => onChange([...photos, ...uris].slice(0, max));

  const shoot = async () => {
    setAsking(false);
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Camera access needed', 'Allow camera access to take a picture.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled && result.assets?.length) add([result.assets[0].uri]);
  };

  const upload = async () => {
    setAsking(false);
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Photo access needed', 'Allow photo access to upload a picture.');
      return;
    }
    const remaining = max - photos.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: remaining > 1,
      selectionLimit: remaining,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) add(result.assets.map((a) => a.uri));
  };

  const slots = Array.from({ length: max });

  return (
    <View style={{ gap: space.sm }}>
      {label ? <Label>{label}</Label> : null}

      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {slots.map((_, i) => {
          const uri = photos[i];
          if (uri) {
            return (
              <View key={i} style={{ flex: 1, aspectRatio: 1 }}>
                <Photo uri={uri} style={{ width: '100%', height: '100%' }} />
                <Pressable
                  onPress={() => onChange(photos.filter((_, idx) => idx !== i))}
                  hitSlop={8}
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
            );
          }

          const isNext = i === photos.length;
          return (
            <Pressable
              key={i}
              onPress={isNext ? () => setAsking(true) : undefined}
              style={{
                flex: 1,
                aspectRatio: 1,
                borderRadius: radius.md,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: isNext ? theme.accent : theme.line,
                backgroundColor: 'rgba(255,255,255,0.5)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <T size={26} color={isNext ? theme.accent : theme.line}>
                +
              </T>
            </Pressable>
          );
        })}
      </View>

      <Modal visible={asking} transparent animationType="fade" onRequestClose={() => setAsking(false)}>
        <Pressable
          onPress={() => setAsking(false)}
          style={{ flex: 1, backgroundColor: 'rgba(20,32,42,0.35)', justifyContent: 'flex-end', padding: space.lg }}
        >
          <View
            style={{
              backgroundColor: theme.cardSolid,
              borderRadius: radius.lg,
              overflow: 'hidden',
              ...shadow,
            }}
          >
            <Pressable onPress={shoot} style={{ padding: space.lg, alignItems: 'center' }}>
              <T size={16} weight="600" color={theme.accent}>
                Take a picture
              </T>
            </Pressable>
            <View style={{ height: 1, backgroundColor: theme.line }} />
            <Pressable onPress={upload} style={{ padding: space.lg, alignItems: 'center' }}>
              <T size={16} weight="600" color={theme.accent}>
                Upload a picture
              </T>
            </Pressable>
            <View style={{ height: 1, backgroundColor: theme.line }} />
            <Pressable onPress={() => setAsking(false)} style={{ padding: space.lg, alignItems: 'center' }}>
              <T size={16} color={theme.muted}>
                Cancel
              </T>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
