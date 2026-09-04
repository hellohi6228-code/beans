import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { space, theme } from '../theme';
import { T } from './ui';

export function Header({
  title,
  subtitle,
  back,
  right,
}: {
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <View style={{ paddingTop: space.sm, paddingHorizontal: space.lg, paddingBottom: space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 34 }}>
        {back ? (
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            hitSlop={12}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: 'rgba(255,255,255,0.8)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <T size={18} weight="600" color={theme.ink}>
              ‹
            </T>
          </Pressable>
        ) : null}

        <View style={{ flex: 1 }}>
          {title ? (
            <T size={20} weight="700" numberOfLines={1} style={{ letterSpacing: -0.3 }}>
              {title}
            </T>
          ) : null}
          {subtitle ? (
            <T size={12.5} color={theme.muted} numberOfLines={1}>
              {subtitle}
            </T>
          ) : null}
        </View>

        {right}
      </View>
    </View>
  );
}
