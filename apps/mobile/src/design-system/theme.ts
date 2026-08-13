import { palette, radius, shadows, sizes, spacing, typography } from "./tokens";

export const theme = {
  colors: {
    primary: palette.green500,
    primaryPressed: palette.green700,
    background: palette.ivory50,
    surface: palette.white,
    surfaceBrand: palette.green900,
    textPrimary: palette.green950,
    textSecondary: palette.neutral600,
    textInverse: palette.white,
    border: palette.green950,
    borderSubtle: palette.neutral200,
    success: palette.green500,
    warning: palette.yellow500,
    danger: palette.red500,
    disabled: palette.neutral200,
    disabledText: palette.neutral400,
  },
  radius,
  shadows,
  sizes,
  spacing,
  typography,
} as const;

export type AppTheme = typeof theme;

