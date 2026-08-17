import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { theme } from "@/design-system";
import { AppText } from "./AppText";

const items = [
  { label: "Accueil", icon: "home-outline", route: "/home" },
  { label: "Explorer", icon: "football-outline", route: "/explore" },
  { label: "Mes matchs", icon: "people-outline", route: "/home" },
  { label: "Messages", icon: "chatbubble-ellipses-outline", route: "/home" },
  { label: "Profil", icon: "person-outline", route: "/home" },
] as const;

export function BottomNavigation({ active = "Accueil" }: { active?: (typeof items)[number]["label"] }) {
  return <View style={styles.bar}>{items.map((item) => { const selected = item.label === active; return <Pressable accessibilityLabel={item.label} accessibilityRole="tab" accessibilityState={{ selected }} key={item.label} onPress={() => router.replace(item.route)} style={styles.item}><Ionicons name={item.icon} size={22} color={selected ? theme.colors.primary : theme.colors.textInverse} /><AppText variant="caption" color={selected ? "primary" : "textInverse"}>{item.label}</AppText>{selected ? <View style={styles.active} /> : null}</Pressable>; })}</View>;
}

const styles = StyleSheet.create({ bar: { backgroundColor: theme.colors.surfaceBrand, borderRadius: theme.radius.xl, flexDirection: "row", minHeight: theme.sizes.control.bottomNavigation, overflow: "hidden", paddingHorizontal: theme.spacing.xxs, paddingTop: theme.spacing.xs, ...theme.shadows.md }, item: { alignItems: "center", flex: 1, gap: 2, justifyContent: "center", minHeight: 56, position: "relative" }, active: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.full, bottom: 0, height: 3, position: "absolute", width: 38 } });
