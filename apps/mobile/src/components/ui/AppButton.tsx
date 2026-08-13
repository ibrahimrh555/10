import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/design-system";
import { AppText } from "./AppText";

type Props = { label: string; onPress: () => void; variant?: "primary" | "secondary" | "ghost"; disabled?: boolean; loading?: boolean; icon?: keyof typeof Ionicons.glyphMap };

export function AppButton({ label, onPress, variant = "primary", disabled, loading, icon }: Props) {
  const filled = variant === "primary";
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, (disabled || loading) && styles.disabled]}>
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={theme.colors.textPrimary} /> : <AppText variant="actionMd" color={filled ? "textPrimary" : "textPrimary"} style={styles.label}>{label.toUpperCase()}</AppText>}
        {icon && !loading ? <Ionicons name={icon} size={theme.sizes.icon.lg} color={theme.colors.textPrimary} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", borderRadius: theme.radius.md, justifyContent: "center", minHeight: theme.sizes.control.button, paddingHorizontal: theme.spacing.md },
  content: { alignItems: "center", flexDirection: "row", justifyContent: "center", width: "100%" },
  label: { flex: 1, textAlign: "center" },
  primary: { backgroundColor: theme.colors.primary },
  secondary: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: theme.sizes.border.default },
  ghost: { backgroundColor: "transparent" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  disabled: { backgroundColor: theme.colors.disabled, opacity: 0.8 },
});

