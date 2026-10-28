import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { useStore } from '../store';
import { space, theme, track } from '../theme';
import { T } from './ui';

const SIZE = 52;
const { width: W, height: H } = Dimensions.get('window');
const START_X = W - SIZE - 18;
const START_Y = H - SIZE - 90;

type Item = { label: string; href: string; coach?: boolean };

/**
 * Drag it anywhere, tap it for the menu. Lives above every screen. Right
 * after picking a supplier type, it force-opens once and points at Post and
 * Listing — see the `tutorial` flag in the store.
 */
export function FloatingNav() {
  const router = useRouter();
  const path = usePathname();
  const { me, tutorial, endTutorial } = useStore();
  const [open, setOpen] = useState(false);
  // Flips to true once the button has been dragged into the top half of the
  // screen, so the menu opens downward instead of running off the top edge.
  const [expandDown, setExpandDown] = useState(START_Y < H / 2);

  // Buyers find; sellers go live and manage their listings.
  const seller = me?.role === 'supplier';
  const items: Item[] = [
    seller ? { label: 'Live', href: '/live', coach: true } : { label: 'Find', href: '/home' },
    { label: 'Post', href: '/new-post', coach: true },
    ...(seller ? [{ label: 'Listing', href: '/listings', coach: true }] : []),
    { label: 'Messages', href: '/messages' },
    { label: 'Profile', href: '/profile' },
  ];

  const pos = useRef(new Animated.ValueXY({ x: START_X, y: START_Y })).current;
  const dragged = useRef(false);

  const pan = useRef(
    PanResponder.create({
      // Only take over once it is clearly a drag, so taps always reach the button.
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6,
      onPanResponderGrant: () => pos.extractOffset(),
      onPanResponderMove: (_, g) => {
        dragged.current = true;
        pos.setValue({ x: g.dx, y: g.dy });
      },
      onPanResponderRelease: () => {
        pos.flattenOffset();
        const x = (pos.x as any)._value;
        const y = (pos.y as any)._value;
        const clampedY = Math.min(Math.max(y, 60), H - SIZE - 30);
        Animated.spring(pos, {
          toValue: {
            x: Math.min(Math.max(x, 12), W - SIZE - 12),
            y: clampedY,
          },
          useNativeDriver: false,
          friction: 8,
        }).start();
        setExpandDown(clampedY < H / 2);
      },
    })
  ).current;

  // Having just picked a supplier type, force the menu open once to show it off.
  useEffect(() => {
    if (tutorial) setOpen(true);
  }, [tutorial]);

  const closeMenu = () => {
    setOpen(false);
    if (tutorial) endTutorial();
  };

  const go = (href: string) => {
    closeMenu();
    router.navigate(href as never);
  };

  // Nothing to navigate to until onboarding is done.
  if (path === '/' || path === '/onboarding') return null;

  return (
    <>
      {open ? (
        <Pressable onPress={closeMenu} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      ) : null}

      <Animated.View
        {...pan.panHandlers}
        style={{
          position: 'absolute',
          transform: [{ translateX: pos.x }, { translateY: pos.y }],
          alignItems: 'flex-end',
        }}
      >
        {open ? (
          <View
            style={[
              {
                position: 'absolute',
                right: 0,
                backgroundColor: theme.surface,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: theme.ink,
                minWidth: 220,
              },
              expandDown ? { top: SIZE + 8 } : { bottom: SIZE + 8 },
            ]}
          >
            {items.map((it, i) => {
              const on = path === it.href;
              const coach = tutorial && it.coach;
              return (
                <Pressable
                  key={it.href}
                  onPress={() => go(it.href)}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: space.lg,
                    borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                    borderTopColor: theme.lineSoft,
                    backgroundColor: coach ? theme.lineSoft : 'transparent',
                  }}
                >
                  <T
                    size={11}
                    weight={on || coach ? '600' : '400'}
                    color={on ? theme.ink : theme.inkSoft}
                    style={{ letterSpacing: track.button, textTransform: 'uppercase' }}
                  >
                    {it.label}
                  </T>
                </Pressable>
              );
            })}

            {tutorial ? (
              <View
                style={{
                  padding: space.lg,
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: theme.lineSoft,
                  gap: space.md,
                }}
              >
                <T size={12} weight="400" color={theme.inkSoft} style={{ lineHeight: 18 }}>
                  Go live to show buyers your goods. Post and Listing are where you list and manage what you sell.
                </T>
                <Pressable onPress={closeMenu} hitSlop={8}>
                  <T
                    size={11}
                    weight="600"
                    color={theme.ink}
                    style={{ letterSpacing: track.button, textDecorationLine: 'underline' }}
                  >
                    GOT IT
                  </T>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}

        <Pressable
          // Reset before every press so a previous drag can never swallow a tap.
          onPressIn={() => {
            dragged.current = false;
          }}
          onPress={() => {
            if (dragged.current) return;
            if (open) closeMenu();
            else setOpen(true);
          }}
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            backgroundColor: theme.ink,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {open ? (
            <T size={13} weight="500" color="#fff" style={{ letterSpacing: 1 }}>
              ×
            </T>
          ) : (
            <Image
              source={require('../../assets/logo-mark.png')}
              resizeMode="contain"
              style={{ width: 28, height: 28, tintColor: '#fff' }}
            />
          )}
        </Pressable>
      </Animated.View>
    </>
  );
}
