import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, BottomNavigation } from "@/components/ui";

export default function MatchSuccessScreen() {
  const { gameId = "club-atlas" } = useLocalSearchParams<{ gameId?: string }>();
  return <SafeAreaView style={styles.safe}><View style={styles.page}><View style={styles.content}>
    <View style={styles.check}><Ionicons color="#0A3828" name="checkmark" size={55} /></View>
    <AppText variant="displayLg" style={styles.title}>TU ES INSCRIT !</AppText>
    <AppText style={styles.description}>Rendez-vous le <AppText style={styles.bold}>Samedi 14 Octobre à 20:00</AppText> au{"\n"}<AppText style={styles.bold}>City Foot Oasis.</AppText></AppText>
    <Pressable accessibilityRole="button" onPress={() => router.replace({ pathname: "/games/[gameId]", params: { gameId } })} style={styles.primary}><AppText style={styles.primaryText}>Voir les détails du match</AppText></Pressable>
    <Pressable accessibilityRole="button" onPress={() => router.replace("/home")} style={styles.secondary}><AppText style={styles.secondaryText}>Retour à l’accueil</AppText></Pressable>
  </View><BottomNavigation active="Matchs" /></View></SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { backgroundColor: "#F7F6EF", flex: 1 }, page: { flex: 1 }, content: { alignItems: "center", flex: 1, justifyContent: "center", paddingHorizontal: 24, paddingBottom: 70 },
  check: { alignItems: "center", backgroundColor: "#20DD77", borderRadius: 52, height: 104, justifyContent: "center", width: 104 },
  title: { color: "#0A3828", fontSize: 40, lineHeight: 49, marginTop: 31, textAlign: "center" }, description: { color: "#65736D", fontSize: 15, lineHeight: 21, marginTop: 10, textAlign: "center" }, bold: { color: "#65736D", fontSize: 15, fontWeight: "800" },
  primary: { alignItems: "center", alignSelf: "stretch", backgroundColor: "#0A3828", borderRadius: 12, justifyContent: "center", marginTop: 31, minHeight: 53 }, primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  secondary: { alignItems: "center", alignSelf: "stretch", backgroundColor: "#FFFFFF", borderColor: "#DDDCD4", borderRadius: 12, borderWidth: 1, justifyContent: "center", marginTop: 12, minHeight: 53 }, secondaryText: { color: "#173B2D", fontSize: 16, fontWeight: "700" },
});
