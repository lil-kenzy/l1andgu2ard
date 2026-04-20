export const colors = {
  // ─── Brand palette ───────────────────────────────────
  amber:        '#F59E0B',
  amberLight:   '#FCD34D',
  amberDark:    '#D97706',

  emerald:      '#10B981',
  emeraldLight: '#6EE7B7',
  emeraldDark:  '#059669',

  crimson:      '#EF4444',
  crimsonLight: '#FCA5A5',
  crimsonDark:  '#DC2626',

  navy:         '#0F172A',
  navyLight:    '#1E293B',
  navyDark:     '#020617',

  // ─── Semantic (keep backward-compat names) ───────────
  primary:   '#3b82f6',
  secondary: '#10B981',   // emerald
  success:   '#10B981',
  warning:   '#F59E0B',   // amber
  error:     '#EF4444',   // crimson
  info:      '#3b82f6',

  // ─── Neutrals ────────────────────────────────────────
  white: '#fff',
  black: '#000',
  gray: {
    50:  '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // ─── Light surfaces ───────────────────────────────────
  background: '#fff',
  surface:    '#fff',
  border:     '#e5e7eb',
  text:       '#1f2937',
  textSecondary: '#6b7280',
  textTertiary:  '#9ca3af',

  // ─── Dark mode ────────────────────────────────────────
  dark: {
    background:    '#0F172A',
    surface:       '#1E293B',
    border:        '#374151',
    text:          '#f3f4f6',
    textSecondary: '#d1d5db',
    textTertiary:  '#9ca3af',
  },

  // ─── Status ───────────────────────────────────────────
  available:  '#10B981',
  underOffer: '#F59E0B',
  sold:       '#6366f1',
  disputed:   '#EF4444',
};

/** Glass surface styles */
export const glass = {
  light: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderColor:     'rgba(255,255,255,0.25)',
    borderWidth:     1 as const,
    borderRadius:    16,
  },
  dark: {
    backgroundColor: 'rgba(15,23,42,0.72)',
    borderColor:     'rgba(255,255,255,0.08)',
    borderWidth:     1 as const,
    borderRadius:    16,
  },
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  h3: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  h4: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  body:      { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  label:     { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
};

export const borderRadius = {
  none: 0,
  sm:   6,
  md:   10,
  lg:   14,
  xl:   18,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8,
  },
  deep: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 12,
  },
};

