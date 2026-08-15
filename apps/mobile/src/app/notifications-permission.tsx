import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

import { AppButton, AppHeader, AppText, ScreenContainer, ScreenTitle } from "@/components/ui";
import { theme } from "@/design-system";
import { useAuthSession } from "@/hooks/use-auth-session";
import { onboardingErrorMessage, onboardingQueryKeys } from "@/lib/onboarding";
import { completeNotificationOnboarding } from "@/lib/notification-onboarding";
import { requestOneSignalRegistration } from "@/lib/one-signal";
import { queryClient, trpcClient } from "@/lib/trpc";

const benefits = [
  { icon: "calendar-outline", title: "Rappels de match", text: "Soyez averti avant le coup d’envoi." },
  { icon: "chatbubble-ellipses-outline", title: "Nouveaux messages", text: "Ne manquez aucun message important." },
  { icon: "people-outline", title: "Places disponibles", text: "Soyez le premier informé des créneaux." },
] as const;

export default function NotificationPermissionScreen() {
  const { user } = useAuthSession();
  const flow = useMutation({
    mutationFn: async (askNativePermission: boolean) => {
      if (!user?.id) throw new Error("session");
      await completeNotificationOnboarding({
        askNativePermission,
        userId: user.id,
        platform: Platform.OS === "ios" || Platform.OS === "android" ? Platform.OS : "unsupported",
        dependencies: {
          requestRegistration: requestOneSignalRegistration,
          registerDevice: input => trpcClient.notifications.registerDevice.mutate(input),
          updatePreferences: input => trpcClient.notifications.updatePreferences.mutate(input),
          completeOnboarding: () => trpcClient.user.completeOnboarding.mutate(),
        },
      });
    },
    onSuccess: async () => {
      await Promise.all(onboardingQueryKeys.map(queryKey => queryClient.invalidateQueries({ queryKey })));
      router.replace("/home");
    },
  });
  const error = flow.error ? onboardingErrorMessage(flow.error, "Certaines informations sont manquantes. Veuillez réessayer.") : null;

  return (
    <ScreenContainer footer={<View style={styles.buttons}><AppButton disabled={flow.isPending} loading={flow.isPending && flow.variables === true} label="Activer les notifications" onPress={() => flow.mutate(true)} /><AppButton disabled={flow.isPending} loading={flow.isPending && flow.variables === false} label="Plus tard" variant="secondary" onPress={() => flow.mutate(false)} /></View>}>
      <AppHeader />
      <ScreenTitle dark="Ne manquez" accent="aucun match" description="Activez les notifications pour rester informé de vos matchs et opportunités de jeu." />
      <View style={styles.bell}><Ionicons name="notifications-outline" size={76} color={theme.colors.textPrimary} /></View>
      <View style={styles.list}>{benefits.map(item => <View key={item.title} style={styles.row}><Ionicons name={item.icon} size={30} color={theme.colors.textPrimary} /><View style={styles.copy}><AppText variant="headingSm">{item.title}</AppText><AppText variant="bodySm" color="textSecondary">{item.text}</AppText></View></View>)}</View>
      {error ? <AppText color="danger" variant="bodySm" style={styles.error}>{error}</AppText> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ bell: { alignItems: "center", backgroundColor: theme.colors.surface, borderRadius: theme.radius.full, height: 150, justifyContent: "center", marginBottom: theme.spacing.xl, marginHorizontal: "auto", width: 150 }, list: { gap: theme.spacing.lg }, row: { alignItems: "center", flexDirection: "row", gap: theme.spacing.md }, copy: { flex: 1 }, buttons: { gap: theme.spacing.sm }, error: { marginTop: theme.spacing.lg, textAlign: "center" } });
