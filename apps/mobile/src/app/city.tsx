import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, BottomNavigation } from "@/components/ui";
import { filterCities, MATCH_CITIES } from "@/features/explore/cities";

export default function CityScreen() {
  const [selected, setSelected] = useState("Errachidia");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => filterCities(MATCH_CITIES, query), [query]);
  return <SafeAreaView style={styles.safe}><View style={styles.page}><View style={styles.content}>
    <View style={styles.header}><Pressable accessibilityLabel="Fermer" onPress={() => router.back()} style={styles.close}><Ionicons color="#FFFFFF" name="close" size={28} /></Pressable><AppText variant="displayMd" style={styles.title}>CHOISIR UNE VILLE</AppText></View>
    <AppText style={styles.label}>OÙ VEUX-TU JOUER ?</AppText>
    <View style={styles.search}><Ionicons color="#91A098" name="search-outline" size={21} /><TextInput onChangeText={setQuery} placeholder="Rechercher une autre ville..." placeholderTextColor="#9AA8A1" style={styles.input} value={query} /></View>
    <View style={styles.chips}>{visible.map(city => <Pressable key={city} onPress={() => setSelected(city)} style={[styles.chip, selected === city && styles.selectedChip]}><AppText style={[styles.chipText, selected === city && styles.selectedText]}>{city}</AppText></Pressable>)}</View>
    <Pressable accessibilityRole="button" onPress={() => router.replace({ pathname: "/explore", params: { city: selected, results: "1" } })} style={styles.button}><AppText style={styles.buttonText}>Explorer les matchs</AppText></Pressable>
  </View><BottomNavigation active="Matchs" /></View></SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { backgroundColor: "#F7F6EF", flex: 1 }, page: { flex: 1 }, content: { flex: 1, paddingHorizontal: 24 },
  header: { alignItems: "center", flexDirection: "row", gap: 15, marginTop: 29 }, close: { alignItems: "center", backgroundColor: "#0A3828", borderRadius: 12, height: 45, justifyContent: "center", width: 45 }, title: { color: "#0A3828", fontSize: 29, lineHeight: 38 },
  label: { color: "#173B2D", fontSize: 14, fontWeight: "800", marginTop: 15 }, search: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#DDDCD4", borderRadius: 12, borderWidth: 1, flexDirection: "row", marginTop: 12, minHeight: 48, paddingHorizontal: 14 },
  input: { color: "#173B2D", flex: 1, fontSize: 14, marginLeft: 9, minHeight: 46 }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginTop: 12 },
  chip: { backgroundColor: "#FFFFFF", borderColor: "#DDDCD4", borderRadius: 18, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 }, selectedChip: { backgroundColor: "#0A3828", borderColor: "#0A3828" }, chipText: { color: "#173B2D", fontSize: 13, fontWeight: "600" }, selectedText: { color: "#13E47A" },
  button: { alignItems: "center", backgroundColor: "#0A3828", borderRadius: 12, justifyContent: "center", marginTop: 24, minHeight: 53 }, buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
