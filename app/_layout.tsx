import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DemoBar } from '../src/components/DemoBar';
import { FloatingNav } from '../src/components/FloatingNav';
import { Screen } from '../src/components/ui';
import { StoreProvider } from '../src/store';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <StatusBar style="dark" />
          <Screen>
            <DemoBar />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="index" options={{ animation: 'none' }} />
              <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
              <Stack.Screen name="new-post" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="edit-profile" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            </Stack>
            {/* Above every screen, not just the tabs. */}
            <FloatingNav />
          </Screen>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
