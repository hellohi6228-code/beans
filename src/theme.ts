/**
 * Editorial, Zara-ish: near-white ground, black type, hairlines instead of
 * cards, no shadows, no rounded corners, a lot of air.
 */
export const theme = {
  // The brand gradient, kept very quiet so it reads as paper.
  gradient: ['#E7EFF6', '#F6F7F8', '#FAFAFA'] as const,
  ink: '#000000',
  inkSoft: '#3A3A3A',
  muted: '#8C8C8C',
  line: '#DEDEDE',
  lineSoft: '#EDEDED',
  surface: '#FFFFFF',
  warn: '#9B1B1B',
};

/** Square corners everywhere. */
export const radius = { sm: 0, md: 0, lg: 0, pill: 999 };

export const space = { xs: 4, sm: 8, md: 12, lg: 20, xl: 32, xxl: 48 };

/** Tracking that makes small uppercase type read as a label. */
export const track = { label: 1.6, button: 1.4, title: 0.2 };
