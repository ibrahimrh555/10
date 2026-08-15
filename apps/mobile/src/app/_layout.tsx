import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { theme } from "@/design-system";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/trpc";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { initializeOneSignal } from "@/lib/one-signal";
import { useEffect } from "react";

function Routes() {
  useAuthGuard();
  return <Stack screenOptions={{ animation: "slide_from_right", contentStyle: { backgroundColor: theme.colors.background }, headerShown: false }} />;
}

export default function RootLayout() {
  useEffect(() => { void initializeOneSignal(); }, []);
  return <QueryClientProvider client={queryClient}><StatusBar style="dark" /><Routes /></QueryClientProvider>;
}
