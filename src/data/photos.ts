/**
 * Seed images are generated locally (no network) so the app looks alive offline.
 * Real photos taken or uploaded by users are plain file:// URIs and render normally.
 * Format: beans://<emoji>/<hexA>/<hexB>/<label>
 */
export const seedPhoto = (emoji: string, a: string, b: string, label: string) =>
  `beans://${encodeURIComponent(emoji)}/${a.replace('#', '')}/${b.replace('#', '')}/${encodeURIComponent(label)}`;

export type SeedPhoto = { emoji: string; a: string; b: string; label: string };

export function parseSeedPhoto(uri?: string): SeedPhoto | null {
  if (!uri || !uri.startsWith('beans://')) return null;
  const [emoji, a, b, label] = uri.slice('beans://'.length).split('/');
  if (!emoji || !a || !b) return null;
  return {
    emoji: decodeURIComponent(emoji),
    a: '#' + a,
    b: '#' + b,
    label: decodeURIComponent(label ?? ''),
  };
}
