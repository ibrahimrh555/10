import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, ImageBackground, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ui";
import { theme } from "@/design-system";
import welcomeBackground from "@/assets/images/welcome-football-pitch.png";
import appLogo from "@/assets/images/app-logo-transparent.png";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        accessibilityIgnoresInvertColors
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
        source={welcomeBackground}
        style={styles.background}
      >
        <View style={styles.content}>
          <View style={styles.intro}>
            <AppText variant="displayLg" style={styles.titleDark}>TROUVEZ</AppText>
            <AppText variant="displayLg" color="primary" style={styles.titleAccent}>
              VOTRE PROCHAIN{"\n"}MATCH
            </AppText>
            <View style={styles.location}>
              <Ionicons name="location-outline" size={theme.sizes.icon.md} color={theme.colors.primary} />
              <AppText variant="bodySm">Matches près de vous</AppText>
            </View>
          </View>

          <View pointerEvents="none" style={styles.logoContainer}>
            <Image
              accessibilityIgnoresInvertColors
              accessibilityLabel="Logo 10in"
              resizeMode="contain"
              source={appLogo}
              style={styles.logo}
            />
          </View>

          <View style={styles.actions}>
            <WelcomeButton label="Commencer" icon="arrow-forward" onPress={() => router.push({ pathname: "/sign-in", params: { intent: "signup" } })} primary />
            <WelcomeButton label="J’ai déjà un compte" onPress={() => router.push({ pathname: "/sign-in", params: { intent: "login" } })} />
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

type WelcomeButtonProps = {
  label: string;
  onPress: () => void;
  primary?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

function WelcomeButton({ label, onPress, primary = false, icon }: WelcomeButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.primaryButton : styles.secondaryButton,
        pressed && styles.buttonPressed,
      ]}
    >
      <AppText variant="actionMd" color={primary ? "textPrimary" : "textInverse"} style={styles.buttonLabel}>
        {label.toUpperCase()}
      </AppText>
      {icon ? <Ionicons name={icon} size={theme.sizes.icon.lg} color={theme.colors.textPrimary} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: theme.colors.background, flex: 1 },
  background: { flex: 1 },
  backgroundImage: { borderRadius: theme.radius.lg },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing["4xl"],
  },
  intro: { alignItems: "flex-start" },
  titleDark: { lineHeight: 38 },
  titleAccent: { lineHeight: 38, marginTop: -2 },
  location: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xxs,
    marginTop: theme.spacing.sm,
  },
  logoContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },

  logo: {
    height: 320,
    width: "100%",
  },
  actions: { gap: theme.spacing.xs },
  button: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: theme.sizes.control.minimumTouch,
    paddingHorizontal: theme.spacing.md,
  },
  primaryButton: { backgroundColor: theme.colors.primary },
  secondaryButton: {
    backgroundColor: theme.colors.surfaceBrand,
    borderColor: theme.colors.textInverse,
    borderWidth: theme.sizes.border.default,
  },
  buttonPressed: { opacity: 0.78 },
  buttonLabel: { flex: 1, textAlign: "center" },
});
