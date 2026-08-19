import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/ui";
import { useAuthSession } from "@/hooks/use-auth-session";
import { onboardingErrorMessage, onboardingQueryKeys } from "@/lib/onboarding";
import { completeNotificationOnboarding } from "@/lib/notification-onboarding";
import { requestOneSignalRegistration } from "@/lib/one-signal";
import { queryClient, trpcClient } from "@/lib/trpc";

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

  return <SafeAreaView style={styles.safe}><View style={styles.content}>
    <View style={styles.bellHalo}><View style={styles.bellInner}><Ionicons color="#0A3828" name="notifications-outline" size={37} /></View></View>
    <AppText variant="displayLg" style={styles.title}>RESTE INFORMÉ</AppText>
    <AppText style={styles.description}>Reçois des alertes instantanées dès qu’un match{"\n"}se crée près de chez toi, ou pour suivre les{"\n"}messages de ton équipe.</AppText>
    {error ? <AppText color="danger" style={styles.error} variant="bodySm">{error}</AppText> : null}
    <Pressable accessibilityRole="button" disabled={flow.isPending} onPress={() => flow.mutate(true)} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>{flow.isPending && flow.variables === true ? <ActivityIndicator color="#FFFFFF" /> : <AppText style={styles.buttonLabel}>Autoriser les notifications</AppText>}</Pressable>
    <Pressable accessibilityRole="button" disabled={flow.isPending} onPress={() => flow.mutate(false)} style={styles.later}><AppText style={styles.laterText}>{flow.isPending && flow.variables === false ? "Chargement…" : "Plus tard"}</AppText></Pressable>
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: "#F7F6EF", flex: 1 }, content: { alignItems: "center", flex: 1, paddingHorizontal: 24 },
  bellHalo: { alignItems: "center", backgroundColor: "#DDF3E4", borderRadius: 61, height: 122, justifyContent: "center", marginTop: 75, width: 122 },
  bellInner: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#11D86C", borderRadius: 40, borderWidth: 2, height: 80, justifyContent: "center", width: 80 },
  title: { color: "#0A3828", fontSize: 40, lineHeight: 49, marginTop: 39, textAlign: "center" },
  description: { color: "#65736D", fontSize: 15.5, lineHeight: 22, marginTop: 10, textAlign: "center" },
  error: { marginTop: 12, textAlign: "center" },
  button: { alignItems: "center", alignSelf: "stretch", backgroundColor: "#0A3828", borderRadius: 12, justifyContent: "center", marginTop: 41, minHeight: 53 },
  buttonLabel: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" }, pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  later: { alignItems: "center", minHeight: 44, paddingTop: 16 }, laterText: { color: "#5F6E67", fontSize: 14, fontWeight: "600", textDecorationLine: "underline" },
});
