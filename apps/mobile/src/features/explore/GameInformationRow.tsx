import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui";
import { theme } from "@/design-system";

export function GameInformationRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return <View style={styles.row}><View style={styles.icon}><Ionicons name={icon} size={18} color={theme.colors.primaryPressed} /></View><View style={styles.copy}><AppText variant="caption" color="textSecondary">{label}</AppText><AppText variant="labelMd">{value}</AppText></View></View>;
}
const styles = StyleSheet.create({ row: { alignItems: "center", flexDirection: "row", gap: 10, minHeight: 48 }, icon: { alignItems: "center", backgroundColor: theme.colors.successSubtle, borderRadius: theme.radius.full, height: 34, justifyContent: "center", width: 34 }, copy: { flex: 1 } });
