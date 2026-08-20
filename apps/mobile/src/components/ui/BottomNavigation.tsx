import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { theme } from "@/design-system";
import { AppText } from "./AppText";

const items = [
  { label: "Accueil", icon: "home-outline", route: "/home" },
  { label: "Matchs", icon: "football", route: "/explore" },
  { label: "Discussions", icon: "chatbubble-outline", route: "/home" },
  { label: "Profil", icon: "person-outline", route: "/home" },
] as const;

export function BottomNavigation({ active = "Accueil" }: { active?: (typeof items)[number]["label"] | "Explorer" }) {
  return <View style={styles.bar}>{items.map((item) => { const selected = item.label === active || (active === "Explorer" && item.label === "Matchs"); return <Pressable accessibilityLabel={item.label} accessibilityRole="tab" accessibilityState={{ selected }} key={item.label} onPress={() => router.replace(item.route)} style={styles.item}><Ionicons name={item.icon} size={22} color={selected ? theme.colors.bottomNavigationActive : theme.colors.textInverse} /><AppText variant="caption" style={{ color: selected ? theme.colors.bottomNavigationActive : theme.colors.textInverse, opacity: selected ? 1 : 0.72 }}>{item.label}</AppText></Pressable>; })}</View>;
}

const styles = StyleSheet.create({ bar: { backgroundColor: theme.colors.surfaceBrand, borderColor: theme.colors.surfaceBrand, borderRadius: 18, borderWidth: 1, flexDirection: "row", marginBottom: 6, marginHorizontal: 12, minHeight: 72, overflow: "hidden", paddingHorizontal: theme.spacing.xxs, paddingTop: 5 }, item: { alignItems: "center", flex: 1, gap: 2, justifyContent: "center", minHeight: 56 } });
