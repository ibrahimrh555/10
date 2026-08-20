import { palette, radius, shadows, sizes, spacing, typography } from "./tokens";

export const theme = {
  colors: {
    primary: palette.green500,
    primaryPressed: palette.green700,
    background: palette.ivory50,
    surface: palette.white,
    surfaceBrand: palette.green900,
    bottomNavigationActive: palette.lime500,
    textPrimary: palette.green950,
    textSecondary: palette.neutral600,
    textInverse: palette.white,
    border: palette.green950,
    borderSubtle: palette.neutral200,
    success: palette.green500,
    successSubtle: palette.green100,
    warning: palette.yellow500,
    danger: palette.red500,
    dangerSubtle: "#FFE7E7",
    overlay: "rgba(0, 0, 0, 0.42)",
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
