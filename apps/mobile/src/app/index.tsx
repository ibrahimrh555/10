import { router } from "expo-router";
import { Image, ImageBackground, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import appLogo from "@/assets/images/app-logo-transparent.png";
import welcomeMatch from "../assets/images/welcome-night-match.png";
import { AppText } from "@/components/ui";
import { theme } from "@/design-system";

export default function WelcomeScreen() {
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.heroShell}>
          <ImageBackground accessibilityIgnoresInvertColors imageStyle={styles.heroImage} resizeMode="cover" source={welcomeMatch} style={styles.hero}>
            <View style={styles.heroShade} />
          </ImageBackground>
        </View>
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel="Logo 10in"
          resizeMode="contain"
          source={appLogo}
          style={styles.logo}
        />

        <View style={styles.content}>
          <View>
            <AppText variant="displayLg" style={styles.title}>LE MATCH{"\n"}COMMENCE ICI.</AppText>
            <AppText variant="bodyMd" style={styles.description}>
              Trouvez des matchs près de chez vous,{"\n"}
              rejoignez des joueurs et vivez votre{"\n"}
              passion du football.
            </AppText>
          </View>

          <View style={styles.bottomArea}>
            <Pressable
              accessibilityLabel="Commencer"
              accessibilityRole="button"
              onPress={() => router.push({ pathname: "/sign-in", params: { intent: "signup" } })}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <AppText style={styles.primaryLabel}>Commencer</AppText>
            </Pressable>

            <View style={styles.signInRow}>
              <AppText variant="bodySm" style={styles.accountText}>Vous avez déjà un compte ?</AppText>
              <Pressable
                accessibilityLabel="Se connecter"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => router.push({ pathname: "/sign-in", params: { intent: "login" } })}
              >
                <AppText variant="bodySm" style={styles.signInText}>Se connecter</AppText>
              </Pressable>
            </View>

           
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F7F7F1", flex: 1 },
  page: { backgroundColor: "#F7F7F1", flex: 1 },
  heroShell: {
    borderBottomLeftRadius: 170,
    borderBottomRightRadius: 170,
    height: "53%",
    marginHorizontal: -38,
    overflow: "hidden",
  },
  hero: { alignItems: "center", flex: 1 },
  heroImage: { transform: [{ scale: 1.02 }] },
  heroShade: {
    backgroundColor: "rgba(0, 28, 18, 0.18)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  logo: {
    alignSelf: "center",
    height: 220,
    position: "absolute",
    tintColor: "#00A65A",
    top: "47%",
    transform: [{ translateY: -65 }],
    width: 240,
    zIndex: 2,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 8,
    paddingHorizontal: 35,
    paddingTop: 48,
  },
  title: {
    color: "#071F17",
    fontSize: 43,
    fontStyle: "italic",
    fontWeight: "900",
    letterSpacing: -1.1,
    lineHeight: 57,
  },
  description: { color: "#202622", fontSize: 15.5, lineHeight: 21, marginTop: 10 },
  bottomArea: { alignItems: "center" },
  primaryButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#064A25",
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 59,
    shadowColor: "#002D18",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  pressed: { backgroundColor: "#003D1E", opacity: 0.9, transform: [{ scale: 0.99 }] },
  primaryLabel: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  signInRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    marginTop: 17,
  },
  accountText: { color: "#303530", fontSize: 13.5 },
  signInText: { color: "#247238", fontSize: 13.5, fontWeight: "700" },
  pagination: { flexDirection: "row", gap: 8, marginTop: 28 },
  dot: { backgroundColor: "#DCE2D2", borderRadius: theme.radius.full, height: 8, width: 18 },
  activeDot: { backgroundColor: "#0A542B" },
});
