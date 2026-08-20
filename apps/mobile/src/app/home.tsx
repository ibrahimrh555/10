import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import nightPitch from "@/assets/images/match-detail-pitch.png";
import pitch5v5 from "@/assets/images/pitch-sunset-5v5.png";
import pitch7v7 from "@/assets/images/pitch-sunset-7v7.png";
import { AppText, BottomNavigation } from "@/components/ui";
import { useAuthSession } from "@/hooks/use-auth-session";

const matches = [
  { id: "club-atlas", format: "5v5", image: pitch5v5, name: "City Foot Oasis", city: "Casablanca", date: "Ce soir, 20:00", players: "7/10 Joueurs", price: "45 DH" },
  { id: "terrain-al-amal", format: "7v7", image: pitch7v7, name: "Foot-Five El Jadida", city: "Casablanca", date: "Demain, 19:30", players: "12/14 Joueurs", price: "50 DH" },
] as const;

export default function HomeScreen() {
  const { user } = useAuthSession();
  const firstName = user?.name?.trim().split(/\s+/)[0] || "Youssef";
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll} horizontal={false} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            {user?.image ? <Image source={{ uri: user.image }} style={styles.avatarImage} /> : <Ionicons color="#0A3828" name="person" size={28} />}
          </View>
          <View style={styles.greeting}><AppText style={styles.hello}>Marhaban 👋</AppText><AppText style={styles.userName}>Salut, {firstName}</AppText></View>
          <Pressable accessibilityLabel="Notifications" accessibilityRole="button" onPress={() => router.push("/notifications-permission")} style={styles.notification}><Ionicons color="#0A3828" name="notifications-outline" size={23} /><View style={styles.badge} /></Pressable>
        </View>

        <View style={styles.banner}><AppText variant="displayMd" style={styles.bannerTitle}>FOOTBALL 5V5 & 7V7</AppText><AppText style={styles.bannerText}>Trouve un match ce soir à Casablanca ou Rabat et réserve ta place.</AppText></View>

        <View style={styles.sectionHeader}><AppText variant="displayMd" style={styles.sectionTitle}>MATCHS À VENIR</AppText><Pressable accessibilityRole="button" onPress={() => router.push("/explore")}><AppText style={styles.seeAll}>Voir tout</AppText></Pressable></View>
        <ScrollView contentContainerStyle={styles.matchRow} horizontal showsHorizontalScrollIndicator={false}>
          {matches.map(match => <MatchPreviewCard key={match.id} match={match} />)}
        </ScrollView>

        <AppText variant="displayMd" style={[styles.sectionTitle, styles.popularTitle]}>TERRAINS POPULAIRES</AppText>
        <Pressable accessibilityRole="button" onPress={() => router.push("/explore")} style={styles.popularCard}>
          <Image source={nightPitch} style={styles.popularImage} />
          <View style={styles.formatChip}><AppText style={styles.chipText}>7v7</AppText></View>
          <AppText style={styles.popularName}>Stade Green Arena</AppText>
          <AppText style={styles.popularLocation}>Casablanca · Terrain synthétique</AppText>
        </Pressable>
      </ScrollView>
      <BottomNavigation active="Accueil" />
    </View>
  </SafeAreaView>;
}

function MatchPreviewCard({ match }: { match: typeof matches[number] }) {
  const open = () => router.push({ pathname: "/games/[gameId]" as never, params: { gameId: match.id } });
  return <Pressable accessibilityRole="button" onPress={open} style={styles.matchCard}>
    <View><Image source={match.image} style={styles.matchImage} /><View style={styles.formatChip}><AppText style={styles.chipText}>{match.format}</AppText></View></View>
    <AppText numberOfLines={1} style={styles.matchName}>{match.name}</AppText>
    <View style={styles.infoRow}><Ionicons color="#65736D" name="location-outline" size={17} /><AppText style={styles.info}>{match.city}</AppText></View>
    <View style={styles.infoRow}><Ionicons color="#65736D" name="calendar-outline" size={17} /><AppText style={styles.info}>{match.date}</AppText></View>
    <View style={styles.cardFooter}><View style={styles.infoRow}><Ionicons color="#173B2D" name="people-outline" size={18} /><AppText style={styles.players}>{match.players}</AppText></View><AppText variant="displayMd" style={styles.price}>{match.price}</AppText></View>
  </Pressable>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: "#F7F6EF", flex: 1 }, page: { flex: 1 }, scroll: { paddingBottom: 18, paddingHorizontal: 24 },
  header: { alignItems: "center", flexDirection: "row", marginTop: 25 },
  avatar: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#00D66B", borderRadius: 25, borderWidth: 2, height: 48, justifyContent: "center", overflow: "hidden", width: 48 },
  avatarImage: { height: "100%", width: "100%" }, greeting: { flex: 1, marginLeft: 12 }, hello: { color: "#69766F", fontSize: 13 }, userName: { color: "#0A3828", fontSize: 17, fontWeight: "800", marginTop: 1 },
  notification: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#DEDCD3", borderRadius: 22, borderWidth: 1, height: 44, justifyContent: "center", position: "relative", width: 44 },
  badge: { backgroundColor: "#16DB72", borderColor: "#FFFFFF", borderRadius: 5, borderWidth: 1, height: 9, position: "absolute", right: 8, top: 7, width: 9 },
  banner: { backgroundColor: "#0A3828", borderRadius: 15, marginTop: 25, paddingHorizontal: 20, paddingVertical: 18 },
  bannerTitle: { color: "#12E579", fontSize: 27, lineHeight: 34 }, bannerText: { color: "#FFFFFF", fontSize: 14, lineHeight: 19, marginTop: 4 },
  sectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 23 },
  sectionTitle: { color: "#0A3828", fontSize: 26, lineHeight: 34 }, seeAll: { color: "#173B2D", fontSize: 13, fontWeight: "700" },
  matchRow: { gap: 16, paddingBottom: 5, paddingTop: 8, paddingRight: 24 },
  matchCard: { backgroundColor: "#FFFFFF", borderColor: "#DDDCD4", borderRadius: 15, borderWidth: 1, padding: 11, shadowColor: "#123C2D", shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.06, shadowRadius: 4, width: 240 },
  matchImage: { borderRadius: 11, height: 110, width: "100%" }, formatChip: { backgroundColor: "#063B28", borderRadius: 7, left: 9, paddingHorizontal: 9, paddingVertical: 5, position: "absolute", top: 9 },
  chipText: { color: "#16E276", fontSize: 13, fontWeight: "800" }, matchName: { color: "#173B2D", fontSize: 17, fontWeight: "800", marginTop: 11 },
  infoRow: { alignItems: "center", flexDirection: "row", gap: 4, marginTop: 3 }, info: { color: "#69766F", fontSize: 13 },
  cardFooter: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between", marginTop: 8 }, players: { color: "#173B2D", fontSize: 13, fontWeight: "700" }, price: { color: "#0A3828", fontSize: 22, lineHeight: 27 },
  popularTitle: { marginTop: 17 }, popularCard: { backgroundColor: "#FFFFFF", borderColor: "#DDDCD4", borderRadius: 15, borderWidth: 1, marginTop: 8, overflow: "hidden", padding: 11 },
  popularImage: { borderRadius: 11, height: 151, width: "100%" }, popularName: { color: "#173B2D", fontSize: 17, fontWeight: "800", marginTop: 9 }, popularLocation: { color: "#69766F", fontSize: 13, marginTop: 2 },
});
