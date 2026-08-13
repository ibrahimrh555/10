import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/design-system";
import { AppText } from "./AppText";
export function Avatar({ selected = false, size = 160 }: { selected?: boolean; size?: number }) { return <View style={[styles.avatar, { height: size, width: size }]}>{selected ? <><View style={styles.person}><AppText variant="displayMd" color="textInverse">IR</AppText></View><View style={styles.badge}><Ionicons name="checkmark" size={22} color={theme.colors.textInverse} /></View></> : <Ionicons name="camera-outline" size={58} color={theme.colors.textInverse} />}</View>; }
const styles = StyleSheet.create({ avatar: { alignItems: "center", alignSelf: "center", backgroundColor: theme.colors.surfaceBrand, borderColor: theme.colors.primary, borderRadius: theme.radius.full, borderWidth: 3, justifyContent: "center" }, person: { alignItems: "center", justifyContent: "center" }, badge: { alignItems: "center", backgroundColor: theme.colors.success, borderRadius: 20, bottom: 4, height: 38, justifyContent: "center", position: "absolute", right: 4, width: 38 } });

