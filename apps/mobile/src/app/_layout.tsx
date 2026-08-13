import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { theme } from "@/design-system";

export default function RootLayout() {
  return <><StatusBar style="dark" /><Stack screenOptions={{ animation: "slide_from_right", contentStyle: { backgroundColor: theme.colors.background }, headerShown: false }} /></>;
}
