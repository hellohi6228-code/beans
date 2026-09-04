export const theme = {
  // Light blue -> very light grey, used as the app-wide background gradient.
  gradient: ['#CFE5F7', '#DFEAF4', '#F2F4F5'] as const,
  gradientSoft: ['#E6F1FA', '#F1F4F6'] as const,
  ink: '#16232E',
  inkSoft: '#43586A',
  muted: '#7C8B99',
  line: '#D9E3EB',
  card: 'rgba(255,255,255,0.86)',
  cardSolid: '#FFFFFF',
  accent: '#2C7CB5',
  accentSoft: '#E3F0FA',
  good: '#2F855A',
  goodSoft: '#E4F2EA',
  warn: '#B0492F',
  warnSoft: '#FBEAE5',
  gold: '#B8862B',
  goldSoft: '#FBF1DD',
};

export const radius = { sm: 8, md: 14, lg: 20, pill: 999 };

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const shadow = {
  shadowColor: '#1B3A50',
  shadowOpacity: 0.07,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};
