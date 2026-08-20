import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, BottomNavigation } from "@/components/ui";
import { ExploreMatchCard, FilterChip } from "@/features/explore/components";
import { mockGames } from "@/mocks/games";

export default function ExploreScreen() {
  const params = useLocalSearchParams<{ city?: string; results?: string }>();
  const city = params.city || "Errachidia";
  const showResults = params.results === "1";
  const games = showResults ? mockGames.slice(0, 2) : mockGames;
  return <SafeAreaView style={styles.safe}><View style={styles.page}>
    {showResults ? <View style={styles.resultsHeader}><Pressable accessibilityLabel="Retour" onPress={() => router.replace("/explore")} style={styles.squareButton}><Ionicons color="#FFFFFF" name="arrow-back" size={28} /></Pressable><View><AppText variant="displayMd" style={styles.resultsTitle}>RÉSULTATS</AppText><AppText style={styles.resultsCount}>2 matchs correspondent à tes filtres</AppText></View></View> : <View style={styles.header}><AppText variant="displayLg" style={styles.title}>MATCHS DISPONIBLES</AppText><Pressable accessibilityLabel="Créer un match" onPress={() => router.push("/explore")} style={styles.squareButton}><Ionicons color="#FFFFFF" name="add" size={27} /></Pressable></View>}
    {showResults ? <View style={styles.activeFilters}><FilterChip label={city + "  ×"} selected onPress={() => router.replace("/explore")} /><FilterChip label="5v5  ×" selected onPress={() => router.replace("/explore")} /></View> : <Pressable accessibilityRole="button" onPress={() => router.push("/city")} style={styles.cityButton}><Ionicons color="#65736D" name="location-outline" size={17} /><AppText style={styles.cityText}>{city}</AppText><Ionicons color="#65736D" name="chevron-down" size={16} /></Pressable>}
    <FlatList contentContainerStyle={styles.list} data={games} keyExtractor={item => item.id} renderItem={({ item }) => <ExploreMatchCard game={item} onPress={() => router.push({ pathname: "/games/[gameId]", params: { gameId: item.id } })} />} showsVerticalScrollIndicator={false} />
    <BottomNavigation active="Matchs" />
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: "#F7F6EF", flex: 1 }, page: { flex: 1 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginHorizontal: 24, marginTop: 30 },
  title: { color: "#0A3828", fontSize: 31, lineHeight: 44 }, squareButton: { alignItems: "center", backgroundColor: "#0A3828", borderRadius: 12, height: 45, justifyContent: "center", width: 45 },
  cityButton: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#FFFFFF", borderColor: "#DDDCD4", borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: 7, marginLeft: 24, marginTop: 21, minHeight: 48, paddingHorizontal: 14 },
  cityText: { color: "#173B2D", fontSize: 13 },
  list: { paddingBottom: 12, paddingHorizontal: 24, paddingTop: 21 },
  resultsHeader: { alignItems: "center", flexDirection: "row", gap: 15, marginHorizontal: 24, marginTop: 30 }, resultsTitle: { color: "#0A3828", fontSize: 31, lineHeight: 35 }, resultsCount: { color: "#65736D", fontSize: 13 },
  activeFilters: { flexDirection: "row", gap: 8, marginHorizontal: 24, marginTop: 18 },
});
