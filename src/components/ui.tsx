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
import { space, theme, track } from '../theme';

/* ------------------------------------------------------------------ text */

export function T({
  children,
  size = 14,
  weight = '300',
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

/** Small, uppercase, widely tracked — the only kind of label in the app. */
export const Label = ({ children }: { children: React.ReactNode }) => (
  <T size={10} weight="500" color={theme.muted} style={{ letterSpacing: track.label, textTransform: 'uppercase' }}>
    {children}
  </T>
);

export const Sub = ({ children }: { children: React.ReactNode }) => (
  <T size={13.5} weight="300" color={theme.inkSoft} style={{ lineHeight: 21 }}>
    {children}
  </T>
);

/* -------------------------------------------------------------- surfaces */

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <LinearGradient colors={theme.gradient} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={[{ flex: 1 }, style]}>
      {children}
    </LinearGradient>
  );
}

/** A block of content separated by hairlines, not a floating card. */
export function Section({
  children,
  style,
  onPress,
  divided = true,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  divided?: boolean;
}) {
  const body = (
    <View
      style={[
        {
          paddingVertical: space.lg,
          borderTopWidth: divided ? StyleSheet.hairlineWidth : 0,
          borderTopColor: theme.line,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => (pressed ? { opacity: 0.6 } : null)}>
      {body}
    </Pressable>
  );
}

export const Rule = () => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.line }} />;

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
  kind?: 'primary' | 'outline' | 'text' | 'danger';
  disabled?: boolean;
  busy?: boolean;
  style?: ViewStyle;
}) {
  const solid = kind === 'primary';
  const danger = kind === 'danger';
  const plain = kind === 'text';

  return (
    <Pressable
      onPress={disabled || busy ? undefined : onPress}
      style={({ pressed }) => [
        {
          height: plain ? 32 : 48,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: space.lg,
          backgroundColor: solid ? theme.ink : 'transparent',
          borderWidth: plain ? 0 : StyleSheet.hairlineWidth,
          borderColor: danger ? theme.warn : theme.ink,
        },
        (disabled || busy) && { opacity: 0.3 },
        pressed && { opacity: 0.6 },
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={solid ? '#fff' : theme.ink} />
      ) : (
        <T
          size={11}
          weight="500"
          color={solid ? '#FFFFFF' : danger ? theme.warn : theme.ink}
          style={{
            letterSpacing: track.button,
            textTransform: 'uppercase',
            textDecorationLine: plain ? 'underline' : 'none',
          }}
        >
          {title}
        </T>
      )}
    </Pressable>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const body = (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: selected ? theme.ink : theme.line,
        backgroundColor: selected ? theme.ink : 'transparent',
        alignSelf: 'flex-start',
      }}
    >
      <T
        size={10}
        weight="500"
        color={selected ? '#fff' : theme.inkSoft}
        style={{ letterSpacing: track.label, textTransform: 'uppercase' }}
      >
        {label}
      </T>
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}

/* ---------------------------------------------------------------- inputs */

export function Field({
  label,
  style,
  ...rest
}: TextInputProps & { label?: string; style?: ViewStyle }) {
  return (
    <View style={[{ gap: space.sm, minWidth: 0 }, style]}>
      {label ? <Label>{label}</Label> : null}
      <TextInput
        placeholderTextColor={theme.muted}
        {...rest}
        style={[
          {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.ink,
            paddingVertical: 8,
            fontSize: 15,
            fontWeight: '300',
            color: theme.ink,
            minWidth: 0,
          },
          rest.multiline && { height: 88, textAlignVertical: 'top' },
        ]}
      />
    </View>
  );
}

export function Checkbox({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <Pressable onPress={onToggle} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
      <View
        style={{
          width: 18,
          height: 18,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.ink,
          backgroundColor: checked ? theme.ink : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked ? (
          <T size={11} weight="600" color="#fff">
            ✓
          </T>
        ) : null}
      </View>
      <T size={13} weight="400" style={{ letterSpacing: 0.3 }}>
        {label}
      </T>
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
    <View style={{ flexDirection: 'row' }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              borderBottomWidth: on ? 1 : StyleSheet.hairlineWidth,
              borderBottomColor: on ? theme.ink : theme.line,
            }}
          >
            <T
              size={11}
              weight={on ? '600' : '400'}
              color={on ? theme.ink : theme.muted}
              style={{ letterSpacing: track.button, textTransform: 'uppercase' }}
            >
              {o.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------------------------------------------------------------- photos */

export function Photo({ uri, style }: { uri?: string; style?: ViewStyle }) {
  if (uri) {
    return <Image source={{ uri }} resizeMode="cover" style={[{ backgroundColor: theme.lineSoft }, style as ImageStyle]} />;
  }
  return <View style={[{ backgroundColor: theme.lineSoft }, style]} />;
}

export function Avatar({ uri, name, size = 40 }: { uri?: string; name: string; size?: number }) {
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  const initials =
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || '·';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.line,
        backgroundColor: theme.surface,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <T size={size * 0.32} weight="400" color={theme.inkSoft} style={{ letterSpacing: 0.5 }}>
        {initials}
      </T>
    </View>
  );
}

/* ------------------------------------------------------------------ misc */

export function Empty({ title }: { title: string }) {
  return (
    <View style={{ paddingVertical: space.xxl, alignItems: 'center' }}>
      <T size={11} weight="400" color={theme.muted} style={{ letterSpacing: track.label, textTransform: 'uppercase' }}>
        {title}
      </T>
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: space.md }, style]}>{children}</View>;
}
