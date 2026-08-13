import type { TextStyle } from "react-native";

export const fontFamilies = { body: "System", display: "sans-serif-condensed" } as const;

export const typography = {
  displayXl: { fontFamily: fontFamilies.display, fontSize: 48, lineHeight: 50, fontWeight: "900", fontStyle: "italic" },
  displayLg: { fontFamily: fontFamilies.display, fontSize: 40, lineHeight: 42, fontWeight: "900", fontStyle: "italic" },
  displayMd: { fontFamily: fontFamilies.display, fontSize: 32, lineHeight: 34, fontWeight: "900" },
  headingLg: { fontSize: 24, lineHeight: 30, fontWeight: "700" },
  headingMd: { fontSize: 20, lineHeight: 26, fontWeight: "600" },
  headingSm: { fontSize: 16, lineHeight: 22, fontWeight: "600" },
  bodyLg: { fontSize: 17, lineHeight: 24, fontWeight: "400" },
  bodyMd: { fontSize: 16, lineHeight: 22, fontWeight: "400" },
  bodySm: { fontSize: 14, lineHeight: 20, fontWeight: "400" },
  labelMd: { fontSize: 14, lineHeight: 18, fontWeight: "500" },
  labelSm: { fontSize: 12, lineHeight: 16, fontWeight: "600" },
  actionMd: { fontFamily: fontFamilies.display, fontSize: 18, lineHeight: 20, fontWeight: "900" },
  caption: { fontSize: 11, lineHeight: 14, fontWeight: "400" },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

