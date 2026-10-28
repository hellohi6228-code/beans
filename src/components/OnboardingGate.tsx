import { usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useStore } from '../store';

/**
 * Keeps an account that hasn't onboarded on the onboarding screen, whatever
 * link it came in on, and sends a finished one off it.
 */
export function OnboardingGate() {
  const { me, onboarded } = useStore();
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (onboarded === undefined || path === '/') return;
    if (!onboarded && path !== '/onboarding') router.replace('/onboarding');
    if (onboarded && path === '/onboarding') router.replace(me?.role === 'supplier' ? '/live' : '/home');
    // Find is for buyers; a seller's front page is Live.
    if (onboarded && me?.role === 'supplier' && path === '/home') router.replace('/live');
  }, [me, onboarded, path, router]);

  return null;
}
