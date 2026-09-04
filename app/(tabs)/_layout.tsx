import { Tabs } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
  return (
    <Tabs tabBar={() => null} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="listings" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
