import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { theme } from "@/design-system";
import { AppText } from "./AppText";

export function AppHeader({ title, subtitle, back = true, onBack }: { title?: string; subtitle?: string; back?: boolean; onBack?: () => void }) {
  return <View style={styles.row}>{back ? <Pressable accessibilityRole="button" accessibilityLabel="Retour" hitSlop={8} onPress={onBack ?? (() => router.back())} style={styles.back}><Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} /></Pressable> : null}<View style={styles.copy}>{title ? <AppText variant="headingLg">{title}</AppText> : null}{subtitle ? <AppText variant="bodySm" color="textSecondary">{subtitle}</AppText> : null}</View></View>;
}
const styles = StyleSheet.create({ row: { alignItems: "center", flexDirection: "row", minHeight: 64, paddingVertical: theme.spacing.xs }, back: { alignItems: "center", borderColor: theme.colors.borderSubtle, borderRadius: theme.radius.full, borderWidth: 1, height: 44, justifyContent: "center", width: 44 }, copy: { flex: 1, marginLeft: theme.spacing.sm } });
