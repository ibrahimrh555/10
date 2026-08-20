import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, ImageBackground, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import pitch from "@/assets/images/match-detail-pitch.png";
import { AppText } from "@/components/ui";
import { ParticipantAvatars } from "@/features/explore/components";
import { findMockGame } from "@/mocks/games";

export default function GameDetailScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const game = findMockGame(gameId);
  if (!game) return <SafeAreaView style={styles.safe}><View style={styles.notFound}><AppText style={styles.title}>MATCH INTROUVABLE</AppText><Pressable onPress={() => router.replace("/explore")} style={styles.button}><AppText style={styles.buttonText}>Retour aux matchs</AppText></Pressable></View></SafeAreaView>;
  const remaining = game.capacity - game.participantsCount;
  const action = () => Alert.alert("Rejoindre ce match", "Votre demande est prête.", [{ text: "Compris" }]);
  return <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}><View style={styles.page}>
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <ImageBackground source={pitch} style={styles.hero}><View style={styles.heroShade} /><Pressable accessibilityLabel="Retour" onPress={() => router.back()} style={styles.back}><Ionicons color="#123C2D" name="arrow-back" size={23} /></Pressable><View style={styles.heroCopy}><View style={styles.heroBadge}><AppText style={styles.heroBadgeText}>{game.format} · {game.status === "almost-full" ? "COMPLET PROCHE" : "DISPONIBLE"}</AppText></View><AppText variant="displayLg" style={styles.heroTitle}>{game.clubName.toUpperCase()}</AppText></View></ImageBackground>
      <View style={styles.content}>
        <View style={styles.stats}><Stat label="TARIF" value={(game.price || 45) + " DH"} /><View style={styles.divider} /><Stat label="NIVEAU" value="INTERMÉDIAIRE" /><View style={styles.divider} /><Stat accent label="PLACES" value={game.participantsCount + "/" + game.capacity} /></View>
        <InfoRow icon="location-outline" text={game.venueAddress} />
        <InfoRow icon="calendar-outline" text="Samedi 14 Octobre · 20:00 - 21:30" />
        <View style={styles.organizer}><View style={styles.organizerAvatar}><AppText style={styles.initials}>YE</AppText></View><View><AppText style={styles.organizerLabel}>ORGANISATEUR</AppText><AppText style={styles.organizerName}>{game.hostName}</AppText></View></View>
        <View style={styles.playersHeader}><AppText style={styles.playersTitle}>Joueurs inscrits</AppText><AppText style={styles.playersCount}>{game.participantsCount} / {game.capacity}</AppText></View>
        <View style={styles.progress}><View style={[styles.progressValue, { width: (String(Math.min(100, game.participantsCount / game.capacity * 100)) + "%") as `${number}%` }]} /></View>
        <View style={styles.avatarRow}><ParticipantAvatars avatars={game.participantAvatars} total={game.participantsCount} />{remaining > 0 ? <AppText style={styles.remaining}>{remaining} places restantes</AppText> : null}</View>
      </View>
    </ScrollView>
    <View style={styles.sticky}><Pressable accessibilityRole="button" onPress={action} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><AppText style={styles.buttonText}>Rejoindre ce match</AppText></Pressable></View>
  </View></SafeAreaView>;
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) { return <View style={styles.stat}><AppText style={styles.statLabel}>{label}</AppText><AppText variant="displayMd" style={[styles.statValue, accent && styles.statAccent]}>{value}</AppText></View>; }
function InfoRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) { return <View style={styles.infoRow}><View style={styles.infoIcon}><Ionicons color="#0A3828" name={icon} size={19} /></View><AppText style={styles.infoText}>{text}</AppText></View>; }

const styles = StyleSheet.create({
  safe: { backgroundColor: "#F7F6EF", flex: 1 }, page: { flex: 1 }, scroll: { paddingBottom: 110 },
  hero: { height: 240, justifyContent: "space-between" }, heroShade: { backgroundColor: "rgba(0,35,23,.25)", bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
  back: { alignItems: "center", backgroundColor: "rgba(255,255,255,.88)", borderRadius: 10, height: 40, justifyContent: "center", marginLeft: 24, marginTop: 23, width: 40 },
  heroCopy: { paddingBottom: 22, paddingHorizontal: 24 }, heroBadge: { alignSelf: "flex-start", backgroundColor: "#13E47A", borderRadius: 6, paddingHorizontal: 9, paddingVertical: 5 }, heroBadgeText: { color: "#0A3828", fontSize: 12, fontWeight: "800" },
  heroTitle: { color: "#FFFFFF", fontSize: 38, lineHeight: 45, marginTop: 4 }, content: { paddingHorizontal: 24, paddingTop: 24 },
  stats: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#DDDCD4", borderRadius: 15, borderWidth: 1, flexDirection: "row", minHeight: 101, paddingHorizontal: 12 },
  stat: { alignItems: "center", flex: 1 }, statLabel: { color: "#91A098", fontSize: 11 }, statValue: { color: "#0A3828", fontSize: 25, lineHeight: 30, marginTop: 4, textAlign: "center" }, statAccent: { color: "#15DE74" }, divider: { backgroundColor: "#E3E0D7", height: 54, width: 1 },
  infoRow: { alignItems: "center", flexDirection: "row", gap: 11, marginTop: 20 }, infoIcon: { alignItems: "center", backgroundColor: "#DDF3E4", borderRadius: 7, height: 26, justifyContent: "center", width: 26 }, infoText: { color: "#173B2D", flex: 1, fontSize: 15 },
  organizer: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#DDDCD4", borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: 11, marginTop: 20, minHeight: 59, paddingHorizontal: 12 },
  organizerAvatar: { alignItems: "center", backgroundColor: "#12DD74", borderRadius: 19, height: 38, justifyContent: "center", width: 38 }, initials: { color: "#0A3828", fontSize: 13 }, organizerLabel: { color: "#91A098", fontSize: 10 }, organizerName: { color: "#173B2D", fontSize: 15, fontWeight: "800" },
  playersHeader: { flexDirection: "row", justifyContent: "space-between", marginTop: 21 }, playersTitle: { color: "#173B2D", fontSize: 16, fontWeight: "800" }, playersCount: { color: "#65736D", fontSize: 16, fontWeight: "700" },
  progress: { backgroundColor: "#DEDCD2", borderRadius: 4, height: 8, marginTop: 8, overflow: "hidden" }, progressValue: { backgroundColor: "#14DB72", height: 8 }, avatarRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 17 }, remaining: { color: "#65736D", fontSize: 12 },
  sticky: { backgroundColor: "#FFFFFF", bottom: 0, left: 0, padding: 16, position: "absolute", right: 0 }, button: { alignItems: "center", backgroundColor: "#0A3828", borderRadius: 12, justifyContent: "center", minHeight: 53 }, buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" }, pressed: { opacity: .82 },
  notFound: { flex: 1, justifyContent: "center", paddingHorizontal: 24 }, title: { color: "#0A3828", fontSize: 32, fontWeight: "800", marginBottom: 20 },
});
