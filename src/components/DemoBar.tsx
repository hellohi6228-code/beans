import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { space, theme } from '../theme';
import { Avatar, T } from './ui';

/**
 * Testing bar. Switch between accounts on this device to check that one user
 * can find and open another user's post.
 */
export function DemoBar() {
  const insets = useSafeAreaInsets();
  const { state, me, switchUser, addTestUser } = useStore();

  return (
    <View
      style={{
        paddingTop: insets.top + 4,
        paddingBottom: 6,
        paddingHorizontal: space.sm,
        backgroundColor: 'rgba(255,255,255,0.75)',
        borderBottomWidth: 1,
        borderBottomColor: theme.line,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
      }}
    >
      <T size={10} weight="700" color={theme.muted} style={{ letterSpacing: 0.6 }}>
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
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                paddingVertical: 3,
                paddingHorizontal: 7,
                borderRadius: 999,
                backgroundColor: on ? theme.accent : 'rgba(255,255,255,0.9)',
                borderWidth: 1,
                borderColor: on ? theme.accent : theme.line,
              }}
            >
              <Avatar uri={u.avatar} name={u.name || `U${i + 1}`} size={18} />
              <T size={11.5} weight="600" color={on ? '#fff' : theme.ink}>
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
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.line,
            backgroundColor: 'rgba(255,255,255,0.9)',
          }}
        >
          <T size={11.5} weight="700" color={theme.accent}>
            + user
          </T>
        </Pressable>
      </ScrollView>
    </View>
  );
}
