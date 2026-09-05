import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, Session } from '@supabase/supabase-js';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';

// Public identifiers only — safe to ship inside the app. Every table is
// behind row level security (see supabase/migrations/0001_init.sql); the
// publishable key can never read or write more than those policies allow.
const SUPABASE_URL = 'https://fknfeygqeqctgfqabxnf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xhDgztXRbcjvKXoOd6y1nQ_e3UnnXZ8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * The account on this device. There is no sign-up screen: the first launch
 * signs in anonymously (the identity lives on the device, the same way the
 * app being tied to a phone would) and everything after that hangs off that
 * session. Requires "Allow anonymous sign-ins" turned on for this Supabase
 * project — Authentication → Sign In / Providers → Anonymous.
 */
export async function ensureSession(): Promise<Session> {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session;

  const { data: signedIn, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return signedIn.session!;
}

const rid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

function guessExt(uri: string): string {
  const dataMatch = /^data:image\/(\w+);/.exec(uri);
  if (dataMatch) return dataMatch[1] === 'jpeg' ? 'jpg' : dataMatch[1];
  const ext = uri.split(/[#?]/)[0].split('.').pop()?.toLowerCase();
  return ext && ext.length <= 4 ? ext : 'jpg';
}

function contentTypeFor(ext: string): string {
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

/**
 * Uploads a photo the camera or library just handed us (a local file://,
 * blob:, or data: URI) to the public `photos` bucket, in the given user's own
 * folder, and returns its public URL. A URL that is already http(s) is left
 * alone — saving a profile without touching its picture should not re-upload
 * it.
 */
export async function uploadPhoto(uri: string, userId: string): Promise<string> {
  if (/^https?:\/\//.test(uri)) return uri;

  const ext = guessExt(uri);
  const path = `${userId}/${rid()}.${ext}`;

  const bytes =
    Platform.OS === 'web' ? await fetch(uri).then((r) => r.arrayBuffer()) : await new File(uri).arrayBuffer();

  const { error } = await supabase.storage
    .from('photos')
    .upload(path, bytes, { contentType: contentTypeFor(ext), upsert: true });
  if (error) throw error;

  return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
}

/** Uploads whichever photos in the list are still local, leaving remote ones as-is. */
export const uploadPhotos = (uris: string[], userId: string) => Promise.all(uris.map((u) => uploadPhoto(u, userId)));
