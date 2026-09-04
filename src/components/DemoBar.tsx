import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { space, theme, track } from '../theme';
import { T } from './ui';

/** Testing bar: switch accounts to check one user can find another's post. */
export function DemoBar() {
  const insets = useSafeAreaInsets();
  const { state, me, switchUser, addTestUser } = useStore();

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
        {state.users.map((u, i) => {
          const on = u.id === me?.id;
          return (
            <Pressable
              key={u.id}
              onPress={() => switchUser(u.id)}
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
                {u.name || `User ${i + 1}`}
              </T>
            </Pressable>
          );
        })}

        <Pressable
          onPress={addTestUser}
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
