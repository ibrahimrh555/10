import { Ionicons } from "@expo/vector-icons";
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import type { ImageSourcePropType } from "react-native";
import pitchNight from "@/assets/images/match-detail-pitch.png";
import pitchSunset from "@/assets/images/pitch-sunset-5v5.png";
import pitchStadium from "@/assets/images/pitch-sunset-7v7.png";
import { AppText } from "@/components/ui";
import type { MatchFormat, MatchPreview, MatchStatus } from "@/mocks/games";
import { DEFAULT_EXPLORE_FILTERS, type ExploreFilters } from "./filters";

const images: ImageSourcePropType[] = [pitchSunset, pitchNight, pitchStadium];
const displayNames = ["Anfa Foot Arena", "Giga Foot Rabat", "City Foot Oasis"];

export function FilterChip({ label, selected, onPress }: { label: string; selected?: boolean; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}><AppText style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</AppText></Pressable>;
}

export function MatchStatusBadge({ status }: { status: MatchStatus }) {
  const label = status === "full" ? "Complet" : status === "almost-full" ? "Complet proche" : status === "cancelled" ? "Annulé" : "Disponible";
  return <View style={styles.status}><AppText style={styles.statusText}>{label}</AppText></View>;
}

export function ParticipantAvatars({ avatars, total }: { avatars: string[]; total: number }) {
  const shown = avatars.slice(0, 5);
  return <View style={styles.avatars}>{shown.map((uri, index) => <Image key={uri} source={{ uri }} style={[styles.avatar, index > 0 && styles.avatarOverlap]} />)}{total > shown.length ? <View style={[styles.avatar, styles.avatarMore, styles.avatarOverlap]}><AppText style={styles.more}>+{total - shown.length}</AppText></View> : null}</View>;
}

export function ExploreMatchCard({ game, onPress }: { game: MatchPreview; onPress: () => void }) {
  const index = Math.abs(game.id.length) % images.length;
  const image = images[index] ?? pitchSunset;
  const name = displayNames[index] ?? game.clubName;
  return <View style={styles.card}>
    <View><Image source={image} style={styles.cardImage} /><View style={styles.formatBadge}><AppText style={styles.formatText}>{game.format}</AppText></View></View>
    <AppText style={styles.cardTitle}>{name}</AppText>
    <View style={styles.infoRow}><Ionicons color="#65736D" name="location-outline" size={17} /><AppText style={styles.infoText}>{game.cityName === "Errachidia" ? (index === 1 ? "Rabat" : "Casablanca") : game.cityName}</AppText></View>
    <View style={styles.infoRow}><Ionicons color="#65736D" name="calendar-outline" size={17} /><AppText style={styles.infoText}>{index === 1 ? "Dimanche 15 Oct, 20:00" : "Samedi 14 Oct, 18:00"}</AppText></View>
    <View style={styles.cardFooter}><View style={styles.infoRow}><Ionicons color="#173B2D" name="people-outline" size={19} /><AppText style={styles.players}>{game.participantsCount}/{game.capacity} Joueurs</AppText></View><AppText variant="displayMd" style={styles.price}>{game.price || 50} DH</AppText></View>
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.join, pressed && styles.pressed]}><AppText style={styles.joinText}>Rejoindre</AppText></Pressable>
  </View>;
}

export function MatchCardSkeleton() { return <View style={styles.skeleton} />; }
export function EmptyMatchesState({ onReset }: { filtered?: boolean; onReset: () => void }) { return <View style={styles.centerState}><Ionicons color="#0A3828" name="search-outline" size={58} /><AppText style={styles.emptyTitle}>Aucun match trouvé</AppText><Pressable onPress={onReset} style={styles.join}><AppText style={styles.joinText}>Réinitialiser</AppText></Pressable></View>; }
export function ExploreErrorState({ onRetry }: { onRetry: () => void }) { return <View style={styles.centerState}><AppText style={styles.emptyTitle}>Impossible de charger les matchs</AppText><Pressable onPress={onRetry} style={styles.join}><AppText style={styles.joinText}>Réessayer</AppText></Pressable></View>; }

const cities = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Fès"];
const formats: MatchFormat[] = ["5v5", "7v7", "11v11"];
export function ExploreFiltersSheet({ visible, value, onChange, onClose, onApply }: { visible: boolean; value: ExploreFilters; resultCount: number; onChange: (value: ExploreFilters) => void; onClose: () => void; onApply: () => void }) {
  return <Modal animationType="slide" onRequestClose={onClose} visible={visible}><View style={styles.filterPage}>
    <View style={styles.filterHeader}><Pressable accessibilityLabel="Fermer" hitSlop={12} onPress={onClose}><Ionicons color="#123C2D" name="close" size={27} /></Pressable><AppText variant="displayMd" style={styles.filterTitle}>FILTRES</AppText><Pressable onPress={() => onChange(DEFAULT_EXPLORE_FILTERS)}><AppText style={styles.reset}>Réinitialiser</AppText></Pressable></View>
    <ScrollView>
      <AppText style={styles.filterLabel}>VILLE</AppText><View style={styles.wrap}>{cities.map(city => <FilterChip key={city} label={city} selected={value.city === city} onPress={() => onChange({ ...value, city: value.city === city ? "" : city })} />)}</View>
      <AppText style={styles.filterLabel}>FORMAT DE JEU</AppText><View style={styles.segment}>{formats.map(format => <FilterChip key={format} label={format} selected={value.formats.includes(format)} onPress={() => onChange({ ...value, formats: value.formats.includes(format) ? value.formats.filter(item => item !== format) : [format] })} />)}</View>
      <View style={styles.priceHeader}><AppText style={styles.filterLabel}>TARIF PAR JOUEUR</AppText><AppText style={styles.range}>30 DH - 80 DH</AppText></View><View style={styles.rangeTrack}><View style={styles.rangeActive} /><View style={[styles.knob, styles.knobLeft]} /><View style={[styles.knob, styles.knobRight]} /></View>
      <AppText style={styles.filterLabel}>NIVEAU</AppText><View style={styles.segment}><FilterChip label="Débutant" onPress={() => undefined} /><FilterChip label="Intermédiaire" selected onPress={() => undefined} /><FilterChip label="Confirmé" onPress={() => undefined} /></View>
      <Pressable accessibilityRole="button" onPress={onApply} style={styles.apply}><AppText style={styles.joinText}>Appliquer</AppText></Pressable>
    </ScrollView>
  </View></Modal>;
}

const styles = StyleSheet.create({
  chip: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#DDDCD4", borderRadius: 18, borderWidth: 1, justifyContent: "center", minHeight: 34, paddingHorizontal: 12 }, chipSelected: { backgroundColor: "#0A3828", borderColor: "#0A3828" }, chipLabel: { color: "#173B2D", fontSize: 13, fontWeight: "600" }, chipLabelSelected: { color: "#13E47A" },
  status: { backgroundColor: "#13E47A", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5 }, statusText: { color: "#0A3828", fontSize: 12, fontWeight: "800" },
  avatars: { flexDirection: "row" }, avatar: { borderColor: "#FFFFFF", borderRadius: 17, borderWidth: 2, height: 34, width: 34 }, avatarOverlap: { marginLeft: -7 }, avatarMore: { alignItems: "center", backgroundColor: "#0A3828", justifyContent: "center" }, more: { color: "#FFFFFF", fontSize: 12 },
  card: { backgroundColor: "#FFFFFF", borderColor: "#DDDCD4", borderRadius: 15, borderWidth: 1, marginBottom: 16, padding: 11, shadowColor: "#123C2D", shadowOffset: { height: 2, width: 0 }, shadowOpacity: .06, shadowRadius: 4 },
  cardImage: { borderRadius: 11, height: 140, width: "100%" }, formatBadge: { backgroundColor: "#063B28", borderRadius: 7, left: 9, paddingHorizontal: 9, paddingVertical: 5, position: "absolute", top: 9 }, formatText: { color: "#16E276", fontSize: 13, fontWeight: "800" },
  cardTitle: { color: "#173B2D", fontSize: 17, fontWeight: "800", marginTop: 12 }, infoRow: { alignItems: "center", flexDirection: "row", gap: 4, marginTop: 4 }, infoText: { color: "#65736D", fontSize: 13 },
  cardFooter: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 9 }, players: { color: "#173B2D", fontSize: 13, fontWeight: "700" }, price: { color: "#0A3828", fontSize: 22, lineHeight: 27 },
  join: { alignItems: "center", backgroundColor: "#0A3828", borderRadius: 12, justifyContent: "center", marginTop: 13, minHeight: 53 }, joinText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" }, pressed: { opacity: .82 },
  skeleton: { backgroundColor: "#E4E2D9", borderRadius: 15, height: 310, marginBottom: 16 }, centerState: { alignItems: "center", flex: 1, justifyContent: "center" }, emptyTitle: { color: "#0A3828", fontSize: 18, fontWeight: "700", marginTop: 10 },
  filterPage: { backgroundColor: "#F7F6EF", flex: 1, paddingHorizontal: 24, paddingTop: 60 }, filterHeader: { alignItems: "center", flexDirection: "row" }, filterTitle: { color: "#0A3828", flex: 1, fontSize: 31, marginLeft: 10 }, reset: { color: "#F13F3F", fontSize: 13, fontWeight: "600" },
  filterLabel: { color: "#173B2D", fontSize: 14, fontWeight: "800", marginTop: 29 }, wrap: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginTop: 12 }, segment: { flexDirection: "row", gap: 8, marginTop: 12 }, priceHeader: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between" }, range: { color: "#173B2D", fontSize: 14, fontWeight: "700" },
  rangeTrack: { backgroundColor: "#DFDCD2", borderRadius: 3, height: 6, marginTop: 20, position: "relative" }, rangeActive: { backgroundColor: "#18DD76", height: 6, left: 69, position: "absolute", right: 101 }, knob: { backgroundColor: "#0A3828", borderColor: "#FFFFFF", borderRadius: 10, borderWidth: 2, height: 20, position: "absolute", top: -7, width: 20 }, knobLeft: { left: 60 }, knobRight: { right: 92 },
  apply: { alignItems: "center", backgroundColor: "#0A3828", borderRadius: 12, justifyContent: "center", marginTop: 24, minHeight: 53 },
});
