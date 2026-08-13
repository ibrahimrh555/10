import type { ViewStyle } from "react-native";
import { palette } from "./colors";

export const shadows = {
  none: {} satisfies ViewStyle,
  sm: { shadowColor: palette.green950, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 } satisfies ViewStyle,
  md: { shadowColor: palette.green950, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4 } satisfies ViewStyle,
} as const;

