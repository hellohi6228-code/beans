import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { FloatingNav } from '../../src/components/FloatingNav';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={() => null}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="messages" />
        <Tabs.Screen name="profile" />
      </Tabs>

      <FloatingNav />
    </View>
  );
}
