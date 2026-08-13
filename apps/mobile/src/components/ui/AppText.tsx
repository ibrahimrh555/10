import type { ComponentProps } from "react";
import { Text } from "react-native";
import { theme, type TypographyVariant } from "@/design-system";

type Props = ComponentProps<typeof Text> & { variant?: TypographyVariant; color?: keyof typeof theme.colors };

export function AppText({ variant = "bodyMd", color = "textPrimary", style, ...props }: Props) {
  return <Text allowFontScaling style={[theme.typography[variant], { color: theme.colors[color] }, style]} {...props} />;
}

