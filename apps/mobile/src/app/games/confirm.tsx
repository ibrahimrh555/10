import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, BottomNavigation } from "@/components/ui";
import { findMockGame } from "@/mocks/games";

export default function ConfirmMatchScreen() {
  const { gameId = "club-atlas" } = useLocalSearchParams<{ gameId?: string }>();
  const game = findMockGame(gameId) ?? findMockGame("club-atlas");
  const name = game?.id === "club-atlas" ? "City Foot Oasis" : game?.clubName ?? "City Foot Oasis";
  return <SafeAreaView style={styles.safe}><View style={styles.page}><View style={styles.content}>
    <View style={styles.header}><Pressable accessibilityLabel="Retour" onPress={() => router.back()} style={styles.back}><Ionicons color="#FFFFFF" name="arrow-back" size={28} /></Pressable><AppText variant="displayMd" style={styles.headerTitle}>CONFIRMATION</AppText></View>
    <View style={styles.alertCircle}><Ionicons color="#0A3828" name="alert-circle-outline" size={39} /></View>
    <AppText variant="displayLg" style={styles.title}>DERNIÈRE ÉTAPE</AppText>
    <AppText style={styles.description}>Tu es sur le point de rejoindre ce match. Assure-{"\n"}toi de pouvoir être présent au créneau indiqué.</AppText>
    <View style={styles.card}><AppText variant="displayMd" style={styles.matchName}>{name.toUpperCase()}</AppText><View style={styles.line} /><View style={styles.info}><Ionicons color="#91A098" name="calendar-outline" size={18} /><AppText style={styles.infoText}>Ce soir, 20:00 · 5v5</AppText></View><View style={styles.info}><Ionicons color="#91A098" name="wallet-outline" size={18} /><AppText style={styles.infoText}>Tarif : 45 DH (à payer sur place)</AppText></View></View>
    <Pressable accessibilityRole="button" onPress={() => router.replace({ pathname: "/games/success", params: { gameId } })} style={styles.primary}><AppText style={styles.primaryText}>Confirmer mon inscription</AppText></Pressable>
    <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.secondary}><AppText style={styles.secondaryText}>Annuler</AppText></Pressable>
  </View><BottomNavigation active="Matchs" /></View></SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { backgroundColor: "#F7F6EF", flex: 1 }, page: { flex: 1 }, content: { flex: 1, paddingHorizontal: 24 },
  header: { alignItems: "center", flexDirection: "row", gap: 22, marginTop: 30 }, back: { alignItems: "center", backgroundColor: "#0A3828", borderRadius: 12, height: 45, justifyContent: "center", width: 45 }, headerTitle: { color: "#0A3828", fontSize: 29 },
  alertCircle: { alignItems: "center", alignSelf: "center", backgroundColor: "#DDF3E4", borderRadius: 41, height: 82, justifyContent: "center", marginTop: 35, width: 82 },
  title: { color: "#0A3828", fontSize: 38, lineHeight: 48, marginTop: 29, textAlign: "center" }, description: { color: "#65736D", fontSize: 15, lineHeight: 21, marginTop: 8, textAlign: "center" },
  card: { backgroundColor: "#FFFFFF", borderColor: "#DDDCD4", borderRadius: 15, borderWidth: 1, marginTop: 31, padding: 18 }, matchName: { color: "#0A3828", fontSize: 22 }, line: { backgroundColor: "#DEDCD3", height: 1, marginVertical: 13 },
  info: { alignItems: "center", flexDirection: "row", gap: 8, marginTop: 8 }, infoText: { color: "#65736D", fontSize: 14 },
  primary: { alignItems: "center", backgroundColor: "#0A3828", borderRadius: 12, justifyContent: "center", marginTop: 31, minHeight: 53 }, primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  secondary: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#DDDCD4", borderRadius: 12, borderWidth: 1, justifyContent: "center", marginTop: 12, minHeight: 53 }, secondaryText: { color: "#173B2D", fontSize: 16, fontWeight: "700" },
});
