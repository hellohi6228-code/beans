import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DemoBar } from '../src/components/DemoBar';
import { FloatingNav } from '../src/components/FloatingNav';
import { OnboardingGate } from '../src/components/OnboardingGate';
import { Screen } from '../src/components/ui';
import { LangProvider } from '../src/i18n';
import { StoreProvider } from '../src/store';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <LangProvider>
            <StatusBar style="dark" />
            <Screen>
              <DemoBar />
              <Stack
                // Each screen paints its own background, so the one underneath
                // never shows through.
                screenLayout={({ children }) => <Screen>{children}</Screen>}
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: 'transparent' },
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="index" options={{ animation: 'none' }} />
                <Stack.Screen name="onboarding" options={{ animation: 'none', gestureEnabled: false }} />
                <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
                <Stack.Screen name="new-post" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="edit-profile" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              </Stack>
              {/* Above every screen, not just the tabs. */}
              <FloatingNav />
              <OnboardingGate />
            </Screen>
          </LangProvider>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
