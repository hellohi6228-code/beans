import { Tabs } from 'expo-router';
import React from 'react';
import { Screen } from '../../src/components/ui';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={() => null}
      // Each tab paints its own background, so a tab left behind never shows
      // through the one in front.
      screenLayout={({ children }) => <Screen>{children}</Screen>}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="live" />
      <Tabs.Screen name="listings" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
