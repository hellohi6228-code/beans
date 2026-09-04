import { usePathname, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { useStore } from '../store';
import { space, theme, track } from '../theme';
import { T } from './ui';

const SIZE = 52;
const { width: W, height: H } = Dimensions.get('window');

/** Drag it anywhere, tap it for the menu. Lives above every screen. */
export function FloatingNav() {
  const router = useRouter();
  const path = usePathname();
  const { me } = useStore();
  const [open, setOpen] = useState(false);

  // Listing only exists for accounts that are currently supplying.
  const items = [
    { label: 'Find', href: '/home' },
    { label: 'Post', href: '/new-post' },
    ...(me?.role === 'supplier' ? [{ label: 'Listing', href: '/listings' }] : []),
    { label: 'Messages', href: '/messages' },
    { label: 'Profile', href: '/profile' },
  ];

  const pos = useRef(new Animated.ValueXY({ x: W - SIZE - 18, y: H - SIZE - 90 })).current;
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
        Animated.spring(pos, {
          toValue: {
            x: Math.min(Math.max(x, 12), W - SIZE - 12),
            y: Math.min(Math.max(y, 60), H - SIZE - 30),
          },
          useNativeDriver: false,
          friction: 8,
        }).start();
      },
    })
  ).current;

  const go = (href: string) => {
    setOpen(false);
    router.navigate(href as never);
  };

  return (
    <>
      {open ? (
        <Pressable
          onPress={() => setOpen(false)}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
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
            style={{
              position: 'absolute',
              bottom: SIZE + 8,
              right: 0,
              backgroundColor: theme.surface,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: theme.ink,
              minWidth: 150,
            }}
          >
            {items.map((it, i) => {
              const on = path === it.href;
              return (
                <Pressable
                  key={it.href}
                  onPress={() => go(it.href)}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: space.lg,
                    borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                    borderTopColor: theme.lineSoft,
                  }}
                >
                  <T
                    size={11}
                    weight={on ? '600' : '400'}
                    color={on ? theme.ink : theme.inkSoft}
                    style={{ letterSpacing: track.button, textTransform: 'uppercase' }}
                  >
                    {it.label}
                  </T>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <Pressable
          // Reset before every press so a previous drag can never swallow a tap.
          onPressIn={() => {
            dragged.current = false;
          }}
          onPress={() => {
            if (!dragged.current) setOpen((v) => !v);
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
          <T size={13} weight="500" color="#fff" style={{ letterSpacing: 1 }}>
            {open ? '×' : '≡'}
          </T>
        </Pressable>
      </Animated.View>
    </>
  );
}
