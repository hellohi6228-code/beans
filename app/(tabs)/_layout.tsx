import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { useStore } from '../../src/store';
import { theme } from '../../src/theme';

const Icon = ({ glyph, focused }: { glyph: string; focused: boolean }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{glyph}</Text>
);

export default function TabsLayout() {
  const { me } = useStore();
  // Everyone buys. Selling is the extra tab, not a different app.
  const sells = me?.role === 'supplier';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.94)',
          borderTopColor: theme.line,
          position: 'absolute',
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Find beans',
          tabBarIcon: ({ focused }) => <Icon glyph="🔍" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="listings"
        options={{
          title: 'Selling',
          href: sells ? undefined : null,
          tabBarIcon: ({ focused }) => <Icon glyph="🫘" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ focused }) => <Icon glyph="💬" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: 'Collection',
          tabBarIcon: ({ focused }) => <Icon glyph="🏅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <Icon glyph="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
