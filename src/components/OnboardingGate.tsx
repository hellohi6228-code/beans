import { usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useStore } from '../store';

/**
 * Keeps an account without a shipping address on the onboarding screen,
 * whatever link it came in on, and sends a finished one off it.
 */
export function OnboardingGate() {
  const { hydrated, me, myAddress } = useStore();
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated || !me || myAddress === undefined || path === '/') return;
    if (myAddress === null && path !== '/onboarding') router.replace('/onboarding');
    if (myAddress !== null && path === '/onboarding') router.replace('/home');
  }, [hydrated, me, myAddress, path, router]);

  return null;
}
