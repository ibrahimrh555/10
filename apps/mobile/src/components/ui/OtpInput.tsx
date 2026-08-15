import { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { theme } from "@/design-system";
import { OTP_LENGTH, sanitizeOtp } from "./otp";
import { AppText } from "./AppText";

export type OtpInputHandle = { focus: () => void };
type Props = { value: string; onChange: (value: string) => void; error?: boolean };

export const OtpInput = forwardRef<OtpInputHandle, Props>(function OtpInput({ value, onChange, error }, ref) {
  const input = useRef<TextInput>(null);
  useImperativeHandle(ref, () => ({ focus: () => input.current?.focus() }));
  return <View accessibilityLabel="Code de vérification à six chiffres" accessibilityHint={error ? "Le code saisi contient une erreur" : "Saisissez les six chiffres reçus par e-mail"} onTouchEnd={() => input.current?.focus()} style={styles.row}>
    {Array.from({ length: OTP_LENGTH }, (_, index) => <View key={index} style={[styles.cell, value.length === index && styles.focused, error && styles.error]}>{value[index] ? <AppText variant="headingLg" style={styles.digit}>{value[index]}</AppText> : null}</View>)}
    <TextInput ref={input} accessibilityLabel="Saisir le code à six chiffres" autoFocus caretHidden keyboardType="number-pad" maxLength={OTP_LENGTH} onChangeText={text => onChange(sanitizeOtp(text))} style={styles.hidden} textContentType="oneTimeCode" value={value} />
  </View>;
});

const styles = StyleSheet.create({ row: { flexDirection: "row", justifyContent: "space-between", position: "relative", width: "100%" }, cell: { alignItems: "center", backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md, borderWidth: 1, height: 58, justifyContent: "center", width: 44 }, focused: { borderColor: theme.colors.primary, borderWidth: 2 }, error: { borderColor: theme.colors.danger }, digit: { color: theme.colors.textPrimary, fontFamily: "sans-serif-condensed", fontSize: 28, fontWeight: "700", lineHeight: 32, textAlign: "center" }, hidden: { bottom: 0, left: 0, opacity: 0.01, position: "absolute", right: 0, top: 0 } });
