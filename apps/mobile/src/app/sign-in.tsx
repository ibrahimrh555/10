import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import {
  AppButton,
  AppHeader,
  AppText,
  AppTextInput,
  ScreenContainer,
  ScreenTitle,
} from "@/components/ui";
import { theme } from "@/design-system";

const cities = ["Errachidia", "Meknès", "Fès", "Marrakech"];

export default function SignInScreen() {
  const { intent } = useLocalSearchParams<{ intent?: string }>();
  const isExistingUser = intent === "login";
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [identifier, setIdentifier] = useState("");
  const [city, setCity] = useState("Errachidia");
  const [cityQuery, setCityQuery] = useState("");

  const visibleCities = cities.filter((item) =>
    item.toLowerCase().includes(cityQuery.trim().toLowerCase()),
  );

  return (
    <ScreenContainer
      footer={
        <AppButton
          disabled={!identifier.trim() || (!isExistingUser && !city)}
          label="Recevoir le code"
          icon="arrow-forward"
          onPress={() => router.push({ pathname: "/otp", params: { intent: isExistingUser ? "login" : "signup" } })}
        />
      }
    >
      <AppHeader />
      {isExistingUser ? (
        <ScreenTitle
          dark="Bon retour"
          description="Connectez-vous avec le téléphone ou l’e-mail associé à votre compte."
        />
      ) : (
        <ScreenTitle dark="Connexion" />
      )}

      <View style={styles.segment}>
        {(["phone", "email"] as const).map((item) => (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === item }}
            key={item}
            onPress={() => {
              setMode(item);
              setIdentifier("");
            }}
            style={[styles.segmentItem, mode === item && styles.activeSegment]}
          >
            <AppText color={mode === item ? "textInverse" : "textPrimary"}>
              {item === "phone" ? "Téléphone" : "E-mail"}
            </AppText>
          </Pressable>
        ))}
      </View>

      {mode === "phone" ? (
        <>
          <AppTextInput
            autoFocus
            icon="call-outline"
            keyboardType="phone-pad"
            label="Numéro de téléphone"
            onChangeText={setIdentifier}
            placeholder="6 12 34 56 78"
            value={identifier}
          />
        </>
      ) : (
        <AppTextInput
          autoCapitalize="none"
          autoFocus
          icon="mail-outline"
          keyboardType="email-address"
          label="Adresse e-mail"
          onChangeText={setIdentifier}
          placeholder="vous@exemple.com"
          value={identifier}
        />
      )}

      {!isExistingUser ? <View style={styles.citySection}>
        <AppText variant="headingSm">Où jouez-vous ?</AppText>
        <AppText variant="bodySm" color="textSecondary">
          Choisissez votre ville.
        </AppText>
        <AppTextInput
          icon="search-outline"
          onChangeText={setCityQuery}
          placeholder="Rechercher une ville"
          value={cityQuery}
        />

        <View style={styles.cityList}>
          {visibleCities.map((item) => {
            const selected = city === item;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                key={item}
                onPress={() => setCity(item)}
                style={[styles.cityRow, selected && styles.cityRowSelected]}
              >
                <AppText>{item}</AppText>
                <Ionicons
                  name={selected ? "radio-button-on" : "radio-button-off"}
                  size={theme.sizes.icon.md}
                  color={selected ? theme.colors.primary : theme.colors.textPrimary}
                />
              </Pressable>
            );
          })}
        </View>
      </View> : null}

      <AppText variant="bodySm" color="textSecondary" style={styles.legal}>
        En continuant, vous acceptez nos Conditions d’utilisation et notre Politique de
        confidentialité.
      </AppText>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  segment: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: theme.sizes.border.default,
    flexDirection: "row",
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.xxs,
  },
  segmentItem: {
    alignItems: "center",
    borderRadius: theme.radius.sm,
    flex: 1,
    justifyContent: "center",
    minHeight: theme.sizes.control.minimumTouch,
  },
  activeSegment: { backgroundColor: theme.colors.surfaceBrand },
  citySection: {
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xl,
  },
  cityList: { gap: theme.spacing.xs },
  cityRow: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSubtle,
    borderRadius: theme.radius.md,
    borderWidth: theme.sizes.border.default,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: theme.sizes.control.minimumTouch,
    paddingHorizontal: theme.spacing.md,
  },
  cityRowSelected: { borderColor: theme.colors.primary },
  legal: { marginTop: theme.spacing.xl },
});
