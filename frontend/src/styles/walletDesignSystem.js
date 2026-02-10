/**
 * Wallet Design System
 * Central source of truth for wallet-specific colors, typography, spacing, and component styles
 * Used across WalletDashboard and EthWallet for consistency
 */

export const colors = {
  // Primary palette (NGN/Naira theme)
  primary: {
    50: '#FEFCE8',
    100: '#FFFBEB',
    400: '#FBBF24',
    500: '#F59E0B', // Amber - represents NGN/currency
    600: '#D97706',
    700: '#B45309',
    900: '#78350F',
  },

  // Secondary palette (ETH theme)
  secondary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    400: '#60A5FA',
    500: '#3B82F6', // Blue - represents ETH/crypto
    600: '#2563EB',
    700: '#1D4ED8',
    900: '#0C4A6E',
  },

  // Accent palette (Action colors)
  accent: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    500: '#64748B', // Slate
    600: '#475569',
  },

  // Status colors
  status: {
    success: '#10B981', // Emerald-500 - Completed/Approved
    successLight: '#D1FAE5', // Emerald-100
    warning: '#EAB308', // Yellow-400 - Pending
    warningLight: '#FEF08A', // Yellow-100
    danger: '#EF4444', // Red-500 - Failed/Cancelled
    dangerLight: '#FEE2E2', // Red-100
    processing: '#8B5CF6', // Violet-500 - Processing
    processingLight: '#EDE9FE', // Violet-100
    info: '#06B6D4', // Cyan-500 - Info
    infoLight: '#CFFAFE', // Cyan-100
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
    muted: '#CBD5E1', // neutral-300
  },

  background: {
    light: '#FFFFFF',
    secondary: '#F8FAFC', // neutral-50
    tertiary: '#F1F5F9', // neutral-100
    dark: '#1E293B', // neutral-800 - dark mode
    overlay: 'rgba(15, 23, 42, 0.5)', // neutral-900 with opacity
    glass: 'rgba(248, 250, 252, 0.7)', // neutral-50 with opacity for glassmorphism
  },

  border: {
    light: '1px solid rgba(148, 163, 184, 0.1)', // neutral-400 with opacity
    default: '1px solid rgba(100, 116, 139, 0.2)', // neutral-500 with opacity
    dark: '1px solid rgba(51, 65, 85, 0.3)', // neutral-700 with opacity
  },
};

export const typography = {
  // Font families
  fontFamily: {
    primary: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
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
    '5xl': '3rem', // 48px
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
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
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
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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

// Component-specific presets
export const components = {
  // Balance card - displays NGN or ETH balance
  balanceCard: {
    base: `
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: ${borderRadius.xl};
      padding: ${spacing[6]};
      box-shadow: ${shadows.md};
      backdrop-filter: blur(10px);
    `,
  },

  // Transaction item - single transaction row
  transactionItem: {
    base: `
      display: flex;
      align-items: center;
      padding: ${spacing[4]};
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      transition: background-color ${transitions.duration.normal} ${transitions.timing.easeInOut};
    `,
    hover: `
      background-color: rgba(248, 250, 252, 0.5);
    `,
  },

  // Status badge
  badge: {
    success: `
      background-color: ${colors.status.successLight};
      color: ${colors.status.success};
    `,
    warning: `
      background-color: ${colors.status.warningLight};
      color: #EAAB00;
    `,
    danger: `
      background-color: ${colors.status.dangerLight};
      color: ${colors.status.danger};
    `,
    processing: `
      background-color: ${colors.status.processingLight};
      color: ${colors.status.processing};
    `,
    info: `
      background-color: ${colors.status.infoLight};
      color: ${colors.status.info};
    `,
  },

  // Button variants
  button: {
    primary: `
      background-color: ${colors.primary[500]};
      color: white;
      border: none;
    `,
    primaryHover: `
      background-color: ${colors.primary[600]};
      box-shadow: ${shadows.lg};
    `,
    secondary: `
      background-color: ${colors.neutral[200]};
      color: ${colors.text.primary};
      border: none;
    `,
    secondaryHover: `
      background-color: ${colors.neutral[300]};
    `,
    danger: `
      background-color: ${colors.status.danger};
      color: white;
      border: none;
    `,
    dangerHover: `
      background-color: #DC2626;
    `,
  },

  // Input field
  input: {
    base: `
      width: 100%;
      padding: ${spacing[3]} ${spacing[4]};
      border: 1px solid ${colors.neutral[300]};
      border-radius: ${borderRadius.md};
      font-size: ${typography.fontSize.base};
      font-family: ${typography.fontFamily.primary};
      transition: all ${transitions.duration.normal} ${transitions.timing.easeInOut};
    `,
    focus: `
      border-color: ${colors.primary[500]};
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
    `,
    error: `
      border-color: ${colors.status.danger};
    `,
  },

  // Modal/overlay
  modal: {
    overlay: `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(4px);
      z-index: 50;
    `,
    content: `
      background-color: white;
      border-radius: ${borderRadius.xl};
      box-shadow: ${shadows.xl};
      max-height: 90vh;
      overflow-y: auto;
    `,
  },

  // Card
  card: {
    base: `
      background-color: white;
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: ${borderRadius.lg};
      box-shadow: ${shadows.sm};
      padding: ${spacing[6]};
      transition: all ${transitions.duration.normal} ${transitions.timing.easeInOut};
    `,
    hover: `
      box-shadow: ${shadows.md};
      border-color: rgba(100, 116, 139, 0.2);
    `,
  },
};

export const media = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
};

// Utility functions for consistent styling
export const getStatusColor = (status) => {
  const statusLower = (status || '').toLowerCase();
  if (statusLower === 'completed' || statusLower === 'approved' || statusLower === 'done') {
    return colors.status.success;
  }
  if (statusLower === 'pending') {
    return colors.status.warning;
  }
  if (statusLower === 'failed' || statusLower === 'rejected' || statusLower === 'cancelled') {
    return colors.status.danger;
  }
  if (statusLower === 'processing') {
    return colors.status.processing;
  }
  return colors.status.info;
};

export const getStatusBgColor = (status) => {
  const statusLower = (status || '').toLowerCase();
  if (statusLower === 'completed' || statusLower === 'approved' || statusLower === 'done') {
    return colors.status.successLight;
  }
  if (statusLower === 'pending') {
    return colors.status.warningLight;
  }
  if (statusLower === 'failed' || statusLower === 'rejected' || statusLower === 'cancelled') {
    return colors.status.dangerLight;
  }
  if (statusLower === 'processing') {
    return colors.status.processingLight;
  }
  return colors.status.infoLight;
};

const walletDesignSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  components,
  media,
  getStatusColor,
  getStatusBgColor,
};

export default walletDesignSystem;
