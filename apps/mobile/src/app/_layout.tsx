import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { theme } from "@/design-system";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/trpc";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { initializeOneSignal } from "@/lib/one-signal";
import { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { AppButton, AppText } from "@/components/ui";
import appLogo from "@/assets/images/app-logo-transparent.png";

function Routes() {
  const guard = useAuthGuard();
  return <View style={styles.root}>
    <Stack screenOptions={{ animation: "slide_from_right", contentStyle: { backgroundColor: theme.colors.background }, headerShown: false }} />
    {guard.isChecking || guard.hasError ? <View accessibilityLabel="Vérification de la session" style={styles.gate}>
      <Image accessibilityIgnoresInvertColors resizeMode="contain" source={appLogo} style={styles.logo} />
      {guard.hasError ? <View style={styles.error}><AppText color="danger" style={styles.center}>Impossible de vérifier votre session.</AppText><AppButton label="Réessayer" variant="secondary" onPress={() => { void guard.retry(); }} /></View> : <ActivityIndicator color={theme.colors.primary} size="large" />}
    </View> : null}
  </View>;
}

export default function RootLayout() {
  useEffect(() => { void initializeOneSignal(); }, []);
  return <QueryClientProvider client={queryClient}><StatusBar style="dark" /><Routes /></QueryClientProvider>;
}

const styles = StyleSheet.create({ root: { flex: 1 }, gate: { alignItems: "center", backgroundColor: theme.colors.background, bottom: 0, justifyContent: "center", left: 0, paddingHorizontal: theme.spacing.xl, position: "absolute", right: 0, top: 0, zIndex: 100 }, logo: { height: 220, marginBottom: theme.spacing.xl, width: 220 }, error: { gap: theme.spacing.md, maxWidth: 360, width: "100%" }, center: { textAlign: "center" } });
