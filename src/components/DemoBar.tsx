import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { space, theme, track } from '../theme';
import { T } from './ui';

/**
 * Testing bar: real backend accounts remembered on this device, so you can
 * flip between them and check that one user can find and open another's
 * post. "+ USER" creates a brand-new anonymous identity on the server.
 */
export function DemoBar() {
  const insets = useSafeAreaInsets();
  const { me, userById, demoAccounts, switchUser, addTestUser } = useStore();
  const [busy, setBusy] = useState(false);

  const guard = (job: () => Promise<void>) => async () => {
    if (busy) return;
    setBusy(true);
    try {
      await job();
    } catch (err) {
      console.warn('[DemoBar]', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View
      style={{
        paddingTop: insets.top + 6,
        paddingBottom: 8,
        paddingHorizontal: space.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.line,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
      }}
    >
      <T size={9} weight="500" color={theme.muted} style={{ letterSpacing: track.label }}>
        DEMO
      </T>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {demoAccounts.map((id, i) => {
          const on = id === me?.id;
          const label = userById(id)?.name || `User ${i + 1}`;
          return (
            <Pressable
              key={id}
              onPress={guard(() => switchUser(id))}
              style={{
                paddingVertical: 4,
                paddingHorizontal: 10,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: on ? theme.ink : theme.line,
                backgroundColor: on ? theme.ink : 'transparent',
              }}
            >
              <T
                size={9.5}
                weight="500"
                color={on ? '#fff' : theme.inkSoft}
                style={{ letterSpacing: track.label, textTransform: 'uppercase' }}
              >
                {label}
              </T>
            </Pressable>
          );
        })}

        <Pressable
          onPress={guard(addTestUser)}
          style={{
            paddingVertical: 4,
            paddingHorizontal: 10,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.line,
          }}
        >
          <T size={9.5} weight="500" color={theme.ink} style={{ letterSpacing: track.label }}>
            + USER
          </T>
        </Pressable>
      </ScrollView>
    </View>
  );
}
