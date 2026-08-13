import { StyleSheet, View } from "react-native";
import { theme } from "@/design-system";
import { AppText } from "./AppText";
export function ScreenTitle({ dark, accent, description }: { dark: string; accent?: string; description?: string }) { return <View style={styles.wrap}><AppText variant="displayLg" style={styles.upper}>{dark}</AppText>{accent ? <AppText variant="displayLg" color="primary" style={styles.upper}>{accent}</AppText> : null}{description ? <AppText variant="bodyMd" style={styles.description}>{description}</AppText> : null}</View>; }
const styles = StyleSheet.create({ wrap: { marginBottom: theme.spacing["2xl"], marginTop: theme.spacing.md }, upper: { textTransform: "uppercase" }, description: { marginTop: theme.spacing.xs, maxWidth: 360 } });

