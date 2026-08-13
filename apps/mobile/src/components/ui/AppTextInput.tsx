import type { ComponentProps } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/design-system";
import { AppText } from "./AppText";

type Props = ComponentProps<typeof TextInput> & { label?: string; error?: string; icon?: keyof typeof Ionicons.glyphMap };

export function AppTextInput({ label, error, icon, style, ...props }: Props) {
  return <View style={styles.group}>{label ? <AppText variant="labelMd">{label}</AppText> : null}<View style={[styles.field, error && styles.error]}>{icon ? <Ionicons name={icon} size={20} color={theme.colors.textPrimary} /> : null}<TextInput placeholderTextColor={theme.colors.textSecondary} style={[styles.input, style]} {...props} /></View>{error ? <AppText variant="bodySm" color="danger">{error}</AppText> : null}</View>;
}
const styles = StyleSheet.create({ group: { gap: theme.spacing.xs }, field: { alignItems: "center", backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md, borderWidth: 1, flexDirection: "row", minHeight: theme.sizes.control.input, paddingHorizontal: theme.spacing.md }, input: { color: theme.colors.textPrimary, flex: 1, fontSize: 16, minHeight: 52, paddingHorizontal: theme.spacing.sm }, error: { borderColor: theme.colors.danger, borderWidth: 2 } });

