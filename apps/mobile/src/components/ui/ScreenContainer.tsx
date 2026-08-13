import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/design-system";

type Props = PropsWithChildren<{ footer?: React.ReactNode; scroll?: boolean }>;
export function ScreenContainer({ children, footer, scroll = true }: Props) {
  const content = <View style={styles.content}>{children}</View>;
  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>{scroll ? <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">{content}</ScrollView> : content}{footer ? <View style={styles.footer}>{footer}</View> : null}</KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { backgroundColor: theme.colors.background, flex: 1 }, flex: { flex: 1 }, scroll: { flexGrow: 1 }, content: { alignSelf: "center", flex: 1, maxWidth: theme.sizes.layout.contentMaxWidth, paddingHorizontal: theme.sizes.layout.screenGutter, width: "100%" }, footer: { alignSelf: "center", maxWidth: theme.sizes.layout.contentMaxWidth, paddingBottom: theme.spacing.md, paddingHorizontal: theme.sizes.layout.screenGutter, paddingTop: theme.spacing.sm, width: "100%" } });

