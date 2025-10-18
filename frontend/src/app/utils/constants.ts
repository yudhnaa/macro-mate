export const COLORS = {
  // Primary Colors
  primary: {
    DEFAULT: '#EA580C',
    light: '#FB923C',
    dark: '#C2410C',
  },
  
  // Indigo Colors (existing colors in your app)
  indigo: {
    DEFAULT: '#4F46E5',
    light: '#6366F1',
    dark: '#4338CA',
    600: '#4F46E5',
    700: '#4338CA',
  },

  // Gray Colors
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Status Colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Background Colors
  background: {
    light: '#FFFFFF',
    dark: '#1F2937',
    gray: '#F9FAFB',
  },

  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    white: '#FFFFFF',
  },

  // Border Colors
  border: {
    light: '#E5E7EB',
    DEFAULT: '#D1D5DB',
    dark: '#9CA3AF',
  },

  // Button Colors
  button: {
    primary: {
      background: '#EA580C',
      hover: '#C2410C',
      text: '#FFFFFF',
    },
    secondary: {
      background: '#4F46E5',
      hover: '#4338CA',
      text: '#FFFFFF',
    },
  },
} as const;

// Export individual color sets for convenience
export const PRIMARY_COLOR = COLORS.primary.DEFAULT;
export const INDIGO_COLOR = COLORS.indigo.DEFAULT;
export const ERROR_COLOR = COLORS.error;
export const SUCCESS_COLOR = COLORS.success;