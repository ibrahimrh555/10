import { useRef } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { theme } from "@/design-system";
import { OTP_LENGTH, sanitizeOtp } from "./otp";
import { AppText } from "./AppText";

export function OtpInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const input = useRef<TextInput>(null);
  const setValue = (text: string) => onChange(sanitizeOtp(text));
  return <View accessibilityLabel="Code de vérification à six chiffres" onTouchEnd={() => input.current?.focus()} style={styles.row}>{Array.from({ length: OTP_LENGTH }, (_, index) => <View key={index} style={[styles.cell, value.length === index && styles.focused]}>{value[index] ? <AppText variant="headingLg" style={styles.digit}>{value[index]}</AppText> : null}</View>)}<TextInput ref={input} autoFocus caretHidden keyboardType="number-pad" onChangeText={setValue} style={styles.hidden} textContentType="oneTimeCode" value={value} /></View>;
}
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
    width: "100%",
  },
  cell: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: theme.sizes.border.default,
    height: 58,
    justifyContent: "center",
    width: 44,
  },
  focused: {
    borderColor: theme.colors.primary,
    borderWidth: theme.sizes.border.strong,
  },
  digit: {
    color: theme.colors.textPrimary,
    fontFamily: "sans-serif-condensed",
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 32,
    textAlign: "center",
  },
  hidden: {
    bottom: 0,
    color: theme.colors.background,
    left: 0,
    opacity: 0.01,
    position: "absolute",
    right: 0,
    top: 0,
  },
});
