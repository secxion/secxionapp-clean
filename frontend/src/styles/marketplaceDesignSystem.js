/**
 * Marketplace Design System
 * Central source of truth for colors, typography, spacing, and component styles
 * Used across all marketplace components for consistency
 */

export const colors = {
  // Primary palette
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    500: '#6366F1', // Indigo
    600: '#4F46E5',
    700: '#4338CA',
    900: '#312E81',
  },

  // Secondary palette
  secondary: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    500: '#8B5CF6', // Violet
    600: '#7C3AED',
    700: '#6D28D9',
  },

  // Accent palette
  accent: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B', // Amber
    600: '#D97706',
    700: '#B45309',
  },

  // Status colors
  status: {
    success: '#10B981', // Emerald-500
    successLight: '#D1FAE5', // Emerald-100
    warning: '#F97316', // Orange-500
    warningLight: '#FFEDD5', // Orange-100
    danger: '#EF4444', // Red-500
    dangerLight: '#FEE2E2', // Red-100
    info: '#3B82F6', // Blue-500
    infoLight: '#DBEAFE', // Blue-100
  },

  // Neutral palette
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Semantic colors
  text: {
    primary: '#0F172A', // neutral-900
    secondary: '#475569', // neutral-600
    tertiary: '#94A3B8', // neutral-400
    inverse: '#F8FAFC', // neutral-50
  },

  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC', // neutral-50
    tertiary: '#F1F5F9', // neutral-100
    overlay: 'rgba(15, 23, 42, 0.5)', // neutral-900 with opacity
  },

  border: {
    light: 'rgba(148, 163, 184, 0.1)', // neutral-400 with opacity
    default: 'rgba(100, 116, 139, 0.2)', // neutral-500 with opacity
    dark: 'rgba(51, 65, 85, 0.3)', // neutral-700 with opacity
  },
};

export const typography = {
  // Font families
  fontFamily: {
    primary: "'Poppins', 'Inter', system-ui, -apple-system, sans-serif",
    mono: "'Fira Code', 'Courier New', monospace",
  },

  // Font sizes
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },

  // Font weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

export const spacing = {
  // Base unit: 4px
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  12: '3rem', // 48px
  16: '4rem', // 64px
};

export const borderRadius = {
  none: '0',
  sm: '0.375rem', // 6px
  base: '0.5rem', // 8px
  md: '0.75rem', // 12px
  lg: '1rem', // 16px
  xl: '1.5rem', // 24px
  '2xl': '2rem', // 32px
  full: '9999px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

export const transitions = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  timing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Component-specific preset styles
export const components = {
  card: {
    base: `
      background-color: ${colors.background.primary};
      border: 1px solid ${colors.border.light};
      border-radius: ${borderRadius.lg};
      box-shadow: ${shadows.sm};
      padding: ${spacing[6]};
      transition: all ${transitions.duration.normal} ${transitions.timing.easeInOut};
    `,
    hover: `
      transform: translateY(-2px);
      box-shadow: ${shadows.md};
    `,
  },

  badge: {
    base: `
      display: inline-flex;
      align-items: center;
      gap: ${spacing[2]};
      padding: ${spacing[2]} ${spacing[3]};
      border-radius: ${borderRadius.full};
      font-size: ${typography.fontSize.sm};
      font-weight: ${typography.fontWeight.medium};
    `,
  },

  button: {
    base: `
      padding: ${spacing[2]} ${spacing[4]};
      border-radius: ${borderRadius.md};
      font-size: ${typography.fontSize.base};
      font-weight: ${typography.fontWeight.semibold};
      border: none;
      cursor: pointer;
      transition: all ${transitions.duration.normal} ${transitions.timing.easeInOut};
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: ${spacing[2]};
    `,
    primary: `
      background-color: ${colors.primary[500]};
      color: white;
    `,
    primaryHover: `
      background-color: ${colors.primary[600]};
    `,
    secondary: `
      background-color: ${colors.neutral[200]};
      color: ${colors.text.primary};
    `,
    secondaryHover: `
      background-color: ${colors.neutral[300]};
    `,
  },
};

export const media = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
};

const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  components,
  media,
};

export default designSystem;
