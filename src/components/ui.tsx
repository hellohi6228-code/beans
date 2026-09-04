import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ImageStyle,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { parseSeedPhoto } from '../data/photos';
import { radius, shadow, space, theme } from '../theme';

/* ------------------------------------------------------------------ text */

export function T({
  children,
  size = 15,
  weight = '400',
  color = theme.ink,
  style,
  numberOfLines,
}: {
  children: React.ReactNode;
  size?: number;
  weight?: TextStyle['fontWeight'];
  color?: string;
  style?: TextStyle | TextStyle[];
  numberOfLines?: number;
}) {
  return (
    <Text numberOfLines={numberOfLines} style={[{ fontSize: size, fontWeight: weight, color }, style]}>
      {children}
    </Text>
  );
}

export const Title = ({ children }: { children: React.ReactNode }) => (
  <T size={26} weight="700" style={{ letterSpacing: -0.4 }}>
    {children}
  </T>
);

export const Sub = ({ children }: { children: React.ReactNode }) => (
  <T size={14} color={theme.inkSoft} style={{ lineHeight: 20 }}>
    {children}
  </T>
);

export const Label = ({ children }: { children: React.ReactNode }) => (
  <T size={12} weight="700" color={theme.muted} style={{ letterSpacing: 0.8, textTransform: 'uppercase' }}>
    {children}
  </T>
);

/* -------------------------------------------------------------- surfaces */

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <LinearGradient
      colors={theme.gradient}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </LinearGradient>
  );
}

export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
}) {
  const body = (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => (pressed ? { opacity: 0.75 } : null)}>
      {body}
    </Pressable>
  );
}

export const Divider = () => <View style={{ height: 1, backgroundColor: theme.line, marginVertical: space.md }} />;

/* --------------------------------------------------------------- buttons */

export function Btn({
  title,
  onPress,
  kind = 'primary',
  disabled,
  busy,
  style,
}: {
  title: string;
  onPress?: () => void;
  kind?: 'primary' | 'ghost' | 'danger' | 'soft';
  disabled?: boolean;
  busy?: boolean;
  style?: ViewStyle;
}) {
  const palette: Record<string, { bg: string; fg: string; border?: string }> = {
    primary: { bg: theme.accent, fg: '#fff' },
    soft: { bg: theme.accentSoft, fg: theme.accent },
    ghost: { bg: 'transparent', fg: theme.inkSoft, border: theme.line },
    danger: { bg: theme.warnSoft, fg: theme.warn },
  };
  const p = palette[kind];
  return (
    <Pressable
      onPress={disabled || busy ? undefined : onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: p.bg, borderColor: p.border ?? 'transparent', borderWidth: p.border ? 1 : 0 },
        (disabled || busy) && { opacity: 0.45 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {busy ? <ActivityIndicator color={p.fg} /> : <T size={15} weight="600" color={p.fg}>{title}</T>}
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  tone = 'neutral',
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: 'neutral' | 'good' | 'warn' | 'gold';
}) {
  const tones = {
    neutral: { bg: theme.accentSoft, fg: theme.accent },
    good: { bg: theme.goodSoft, fg: theme.good },
    warn: { bg: theme.warnSoft, fg: theme.warn },
    gold: { bg: theme.goldSoft, fg: theme.gold },
  } as const;
  const c = tones[tone];
  const body = (
    <View
      style={[
        styles.chip,
        { backgroundColor: selected ? theme.accent : c.bg, borderColor: selected ? theme.accent : 'transparent' },
      ]}
    >
      <T size={12.5} weight="600" color={selected ? '#fff' : c.fg}>
        {label}
      </T>
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}

/* ---------------------------------------------------------------- inputs */

export function Field({
  label,
  hint,
  style,
  ...rest
}: TextInputProps & { label?: string; hint?: string; style?: ViewStyle }) {
  return (
    <View style={[{ gap: space.xs, minWidth: 0 }, style]}>
      {label ? <Label>{label}</Label> : null}
      <TextInput
        placeholderTextColor={theme.muted}
        {...rest}
        style={[styles.input, rest.multiline && { height: 110, paddingTop: 12, textAlignVertical: 'top' }]}
      />
      {hint ? <T size={12} color={theme.muted}>{hint}</T> : null}
    </View>
  );
}

export function Checkbox({
  checked,
  onToggle,
  label,
  sublabel,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  sublabel?: string;
}) {
  return (
    <Pressable onPress={onToggle} style={styles.checkRow}>
      <View style={[styles.box, checked && { backgroundColor: theme.accent, borderColor: theme.accent }]}>
        {checked ? <T size={14} weight="700" color="#fff">✓</T> : null}
      </View>
      <View style={{ flex: 1 }}>
        <T size={15} weight="600">{label}</T>
        {sublabel ? <T size={12.5} color={theme.muted} style={{ marginTop: 2 }}>{sublabel}</T> : null}
      </View>
    </Pressable>
  );
}

export function Segmented<V extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: V; label: string }[];
  value: V;
  onChange: (v: V) => void;
}) {
  return (
    <View style={styles.segment}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.segmentItem, on && styles.segmentItemOn]}
          >
            <T size={14} weight={on ? '700' : '500'} color={on ? theme.accent : theme.inkSoft}>
              {o.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------------------------------------------------------------- photos */

const HUES = ['#CFE0EF', '#D9E7DC', '#EFE2CE', '#E6DCEC', '#D6E6E8', '#EEDCD8'];

function hueFor(seed: string) {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n * 31 + seed.charCodeAt(i)) >>> 0;
  return HUES[n % HUES.length];
}

/**
 * The one image element in the app. A real photo (file:// from the camera or
 * library, or http) renders as an image; a `beans://` seed photo renders as a
 * generated tile so the sample content looks alive with no network; anything
 * missing falls back to a calm coloured tile.
 */
export function Photo({
  uri,
  seed = 'beans',
  glyph = '☕',
  style,
  radius: r = radius.md,
}: {
  uri?: string;
  seed?: string;
  glyph?: string;
  style?: ViewStyle;
  radius?: number;
}) {
  const generated = parseSeedPhoto(uri);

  if (generated) {
    return (
      <LinearGradient
        colors={[generated.a, generated.b]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[{ borderRadius: r, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, style]}
      >
        <T size={34}>{generated.emoji}</T>
        {generated.label ? (
          <T size={10.5} color="rgba(22,35,46,0.5)" weight="600" style={{ marginTop: 4, paddingHorizontal: 8 }}>
            {generated.label}
          </T>
        ) : null}
      </LinearGradient>
    );
  }

  if (uri) {
    return (
      <Image
        source={{ uri }}
        resizeMode="cover"
        style={[{ borderRadius: r, backgroundColor: theme.line }, style as ImageStyle]}
      />
    );
  }

  return (
    <View
      style={[
        { borderRadius: r, backgroundColor: hueFor(seed), alignItems: 'center', justifyContent: 'center' },
        style,
      ]}
    >
      <T size={26}>{glyph}</T>
    </View>
  );
}

export function Avatar({ uri, name, size = 44 }: { uri?: string; name: string; size?: number }) {
  const generated = parseSeedPhoto(uri);

  if (generated) {
    return (
      <LinearGradient
        colors={[generated.a, generated.b]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <T size={size * 0.45}>{generated.emoji}</T>
      </LinearGradient>
    );
  }

  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: hueFor(name),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <T size={size * 0.36} weight="700" color={theme.ink}>
        {initials}
      </T>
    </View>
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const full = Math.round(value);
  return (
    <T size={size} color={theme.gold}>
      {'★★★★★'.slice(0, full)}
      <T size={size} color={theme.line}>
        {'★★★★★'.slice(full)}
      </T>
    </T>
  );
}

/* ----------------------------------------------------------------- misc */

export function Empty({ glyph, title, body }: { glyph: string; title: string; body?: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: space.xxl, gap: space.sm }}>
      <T size={34}>{glyph}</T>
      <T size={16} weight="600">{title}</T>
      {body ? (
        <T size={13.5} color={theme.muted} style={{ textAlign: 'center', maxWidth: 260, lineHeight: 19 }}>
          {body}
        </T>
      ) : null}
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: space.sm }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    ...shadow,
  },
  btn: {
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  input: {
    backgroundColor: theme.cardSolid,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.line,
    paddingHorizontal: space.md,
    height: 50,
    fontSize: 16,
    color: theme.ink,
    // Text inputs have an intrinsic min width on web; without this they refuse
    // to shrink inside a flex row and push their neighbours off screen.
    minWidth: 0,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.sm,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: theme.muted,
    backgroundColor: theme.cardSolid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: theme.line,
  },
  segmentItem: {
    flex: 1,
    height: 40,
    borderRadius: radius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemOn: {
    backgroundColor: theme.cardSolid,
    ...shadow,
    shadowOpacity: 0.05,
  },
});
