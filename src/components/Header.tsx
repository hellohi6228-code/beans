import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { space, theme, track } from '../theme';
import { T } from './ui';

export function Header({ title, subtitle, back }: { title?: string; subtitle?: string; back?: boolean }) {
  const router = useRouter();

  return (
    <View style={{ paddingTop: space.lg, paddingHorizontal: space.lg, paddingBottom: space.lg }}>
      {back ? (
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          hitSlop={14}
          style={{ marginBottom: space.md }}
        >
          <T size={11} weight="400" color={theme.ink} style={{ letterSpacing: track.button }}>
            ← BACK
          </T>
        </Pressable>
      ) : null}

      {title ? (
        <T size={20} weight="300" numberOfLines={2} style={{ letterSpacing: track.title }}>
          {title}
        </T>
      ) : null}
      {subtitle ? (
        <T size={10} weight="400" color={theme.muted} style={{ letterSpacing: track.label, textTransform: 'uppercase', marginTop: 4 }}>
          {subtitle}
        </T>
      ) : null}
    </View>
  );
}
