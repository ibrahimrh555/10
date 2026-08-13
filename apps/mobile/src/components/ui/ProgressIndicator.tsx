import { StyleSheet, View } from "react-native";
import { theme } from "@/design-system";
import { AppText } from "./AppText";
export function ProgressIndicator({ step, total = 3 }: { step: number; total?: number }) { return <View style={styles.wrap}><View style={styles.pill}><AppText variant="labelMd">{step} sur {total}</AppText></View><View style={styles.track}>{Array.from({ length: total }, (_, i) => <View key={i} style={[styles.dot, i < step && styles.active]} />)}</View></View>; }
const styles = StyleSheet.create({ wrap: { alignItems: "center", gap: theme.spacing.sm, marginVertical: theme.spacing.xs }, pill: { borderColor: theme.colors.borderSubtle, borderRadius: theme.radius.full, borderWidth: 1, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xxs }, track: { flexDirection: "row", gap: theme.spacing.lg }, dot: { backgroundColor: theme.colors.disabledText, borderRadius: 6, height: 10, width: 10 }, active: { backgroundColor: theme.colors.primary } });

