import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import {
  AppText,
  BottomNavigation,
  MatchCard,
  ScreenContainer,
  type Match,
} from "@/components/ui";
import { theme } from "@/design-system";

const matches: Match[] = [
  {
    time: "20:30",
    format: "5 contre 5",
    venue: "Terrain Atlas, Errachidia",
    city: "Quartier Al Massira, Errachidia",
    distance: "2,4 km",
    players: "8/10",
  },
  {
    time: "19:00",
    format: "5 contre 5",
    venue: "Complexe Sportif Al Inbiaat",
    city: "Hay Al Inbiaat, Marrakech",
    distance: "3,1 km",
    players: "6/10",
  },
  {
    time: "21:15",
    format: "5 contre 5",
    venue: "Stade Municipal, Fès",
    city: "Route d’Immouzer, Fès",
    distance: "4,7 km",
    players: "7/10",
  },
];

export default function HomeScreen() {
  const featured = matches[0]!;

  return (
    <ScreenContainer scroll footer={<BottomNavigation />}>
      <View style={styles.header}>
        <View>
          <AppText variant="headingLg">Bonsoir Ibrahim</AppText>
          <View style={styles.location}>
            <Ionicons
              name="location-outline"
              size={18}
              color={theme.colors.primary}
            />
            <AppText variant="bodySm" color="textSecondary">
              Errachidia
            </AppText>
          </View>
        </View>

        <Pressable
          accessibilityLabel="Ouvrir les notifications"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.push("/notifications-permission")}
          style={({ pressed }) => [
            styles.notificationButton,
            pressed && styles.notificationButtonPressed,
          ]}
        >
          <Ionicons
            name="notifications-outline"
            size={theme.sizes.icon.lg}
            color={theme.colors.textPrimary}
          />
          <View style={styles.notificationBadge} />
        </Pressable>
      </View>

      <AppText variant="labelSm" style={styles.section}>
        VOTRE PROCHAIN MATCH
      </AppText>
      <MatchCard featured match={featured} />

      <View style={styles.sectionRow}>
        <AppText variant="labelSm">MATCHS PRÈS DE VOUS</AppText>
        <AppText variant="bodySm" color="primary">
          Voir tout
        </AppText>
      </View>

      <View style={styles.list}>
        {matches.slice(1).map((match) => (
          <MatchCard key={match.time} match={match} />
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: theme.spacing.sm,
  },
  location: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xxs,
  },
  notificationButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSubtle,
    borderRadius: theme.radius.full,
    borderWidth: theme.sizes.border.default,
    height: theme.sizes.control.minimumTouch,
    justifyContent: "center",
    position: "relative",
    width: theme.sizes.control.minimumTouch,
  },
  notificationButtonPressed: {
    backgroundColor: theme.colors.disabled,
  },
  notificationBadge: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    height: 10,
    position: "absolute",
    right: 7,
    top: 7,
    width: 10,
  },
  section: {
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.lg,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.lg,
  },
  list: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.md,
  },
});
