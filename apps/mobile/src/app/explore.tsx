import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, BottomNavigation } from "@/components/ui";
import { ExploreFiltersSheet, ExploreMatchCard, FilterChip } from "@/features/explore/components";
import { activeFilterCount, DEFAULT_EXPLORE_FILTERS, filterGames, type ExploreFilters } from "@/features/explore/filters";
import { mockGames } from "@/mocks/games";

export default function ExploreScreen() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ExploreFilters>(DEFAULT_EXPLORE_FILTERS);
  const [draft, setDraft] = useState(filters);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const games = useMemo(() => filterGames(mockGames, query, filters), [filters, query]);
  const openFilters = () => { setDraft(filters); setSheetOpen(true); };
  const removeCity = () => setFilters({ ...filters, city: "" });
  const removeFormat = (format: ExploreFilters["formats"][number]) => setFilters({ ...filters, formats: filters.formats.filter(item => item !== format) });
  return <SafeAreaView style={styles.safe}><View style={styles.page}>
    {showResults ? <View style={styles.resultsHeader}><Pressable accessibilityLabel="Retour" hitSlop={12} onPress={() => setShowResults(false)}><Ionicons color="#123C2D" name="arrow-back" size={25} /></Pressable><View><AppText variant="displayMd" style={styles.resultsTitle}>RÉSULTATS</AppText><AppText style={styles.resultsCount}>{games.length} matchs correspondent à tes filtres</AppText></View></View> : <AppText variant="displayLg" style={styles.title}>MATCHS DISPONIBLES</AppText>}
    {showResults ? <View style={styles.activeFilters}>{filters.city ? <FilterChip label={filters.city + "  ×"} selected onPress={removeCity} /> : null}{filters.formats.map(format => <FilterChip key={format} label={format + "  ×"} selected onPress={() => removeFormat(format)} />)}</View> : <View style={styles.searchRow}><View style={styles.search}><Ionicons color="#65736D" name="search-outline" size={22} /><TextInput onChangeText={setQuery} placeholder="Trouver un terrain..." placeholderTextColor="#9AA8A1" style={styles.input} value={query} /></View><Pressable accessibilityLabel="Filtres" accessibilityRole="button" onPress={openFilters} style={styles.filterButton}><Ionicons color="#16E276" name="options-outline" size={24} />{activeFilterCount(filters) ? <View style={styles.count}><AppText style={styles.countText}>{activeFilterCount(filters)}</AppText></View> : null}</Pressable></View>}
    <FlatList contentContainerStyle={styles.list} data={games} keyExtractor={item => item.id} renderItem={({ item }) => <ExploreMatchCard game={item} onPress={() => router.push({ pathname: "/games/[gameId]", params: { gameId: item.id } })} />} showsVerticalScrollIndicator={false} />
    <BottomNavigation active="Matchs" />
    <ExploreFiltersSheet visible={sheetOpen} value={draft} resultCount={games.length} onChange={setDraft} onClose={() => setSheetOpen(false)} onApply={() => { setFilters(draft); setSheetOpen(false); setShowResults(true); }} />
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: "#F7F6EF", flex: 1 }, page: { flex: 1 },
  title: { color: "#0A3828", fontSize: 30, lineHeight: 49, marginHorizontal: 24, marginTop: 31 },
  searchRow: { flexDirection: "row", gap: 12, marginHorizontal: 24, marginTop: 17 },
  search: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#DDDCD4", borderRadius: 12, borderWidth: 1, flex: 1, flexDirection: "row", minHeight: 49, paddingHorizontal: 13 },
  input: { color: "#173B2D", flex: 1, fontSize: 14, marginLeft: 8, minHeight: 47 },
  filterButton: { alignItems: "center", backgroundColor: "#0A3828", borderRadius: 12, height: 49, justifyContent: "center", position: "relative", width: 49 },
  count: { alignItems: "center", backgroundColor: "#16E276", borderRadius: 8, height: 16, justifyContent: "center", position: "absolute", right: -3, top: -3, width: 16 }, countText: { color: "#0A3828", fontSize: 10, fontWeight: "800" },
  list: { paddingBottom: 12, paddingHorizontal: 24, paddingTop: 19 },
  resultsHeader: { alignItems: "center", flexDirection: "row", gap: 12, marginHorizontal: 24, marginTop: 30 }, resultsTitle: { color: "#0A3828", fontSize: 31, lineHeight: 35 }, resultsCount: { color: "#65736D", fontSize: 13, marginTop: 1 },
  activeFilters: { flexDirection: "row", gap: 8, marginHorizontal: 24, marginTop: 18 },
});
