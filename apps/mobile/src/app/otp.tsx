import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, OtpInput, type OtpInputHandle } from "@/components/ui";
import { isOtpComplete } from "@/components/ui/otp";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage, maskEmail } from "@/lib/auth-errors";
import { queryClient, queryKeys, trpcClient } from "@/lib/trpc";
import { pendingAuthStore, usePendingAuth } from "@/stores/pending-auth-store";

const nextRoute = { NAME: "/name", PHOTO: "/photo", NOTIFICATIONS: "/notifications-permission", COMPLETED: "/home" } as const;

export default function OtpScreen() {
  const pending = usePendingAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [now, setNow] = useState(Date.now());
  const input = useRef<OtpInputHandle>(null);
  const hasPendingAuth = Boolean(pending.email && pending.intent && (pending.intent === "login" || pending.cityId));
  const signInRoute = { pathname: "/sign-in" as const, params: { intent: pending.intent ?? "login" } };
  const remaining = Math.max(0, 60 - Math.floor((now - (pending.requestedAt ?? now)) / 1000));

  useEffect(() => {
    if (!hasPendingAuth) router.replace(signInRoute);
  }, [hasPendingAuth, pending.intent]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const verify = useMutation({
    mutationFn: async () => {
      if (!hasPendingAuth || !pending.email || !pending.intent) throw new Error("missing_pending_auth");
      if (!isOtpComplete(code)) throw new Error("incomplete_otp");
      const result = await authClient.signIn.emailOtp({ email: pending.email, otp: code });
      if (result.error) throw result.error;
      const session = await authClient.getSession();
      if (session.error || !session.data?.session) throw new Error("session_not_created");
      queryClient.setQueryData(queryKeys.session, session.data);
      if (pending.intent === "signup") {
        if (!pending.cityId) throw new Error("missing_pending_auth");
        await trpcClient.user.setCity.mutate({ cityId: pending.cityId });
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
      const onboarding = await trpcClient.user.getOnboardingStatus.query();
      queryClient.setQueryData(queryKeys.onboarding, onboarding);
      return onboarding.nextStep;
    },
    onSuccess(nextStep) {
      pendingAuthStore.clearPendingAuth();
      setCode("");
      router.replace(nextRoute[nextStep]);
    },
    onError(rawError) {
      const message = rawError instanceof Error && rawError.message === "incomplete_otp"
        ? "Saisissez les six chiffres du code."
        : authErrorMessage(rawError as never, "verify");
      setError(message);
      setCode("");
      if ((rawError as { code?: string })?.code?.includes("EXPIRED")) setExpired(true);
      setTimeout(() => input.current?.focus(), 0);
    },
  });

  const resend = useMutation({
    mutationFn: async () => {
      if (!pending.email || remaining > 0) throw new Error("resend_unavailable");
      const result = await authClient.emailOtp.sendVerificationOtp({ email: pending.email, type: "sign-in" });
      if (result.error) throw result.error;
    },
    onSuccess() {
      if (!pending.email || !pending.intent) return;
      pendingAuthStore.setPendingAuth(pending.email, pending.cityId, pending.intent, Date.now());
      setNow(Date.now());
      setCode("");
      setError(null);
      setExpired(false);
      Alert.alert("Code envoyé", "Un nouveau code vient de vous être envoyé.");
    },
    onError(rawError) {
      if (rawError instanceof Error && rawError.message === "resend_unavailable") return;
      Alert.alert("Code non envoyé", authErrorMessage(rawError as never, "send"));
    },
  });

  if (!hasPendingAuth || !pending.email) return null;

  const goBack = () => {
    pendingAuthStore.clearPendingAuth();
    setCode("");
    router.replace(signInRoute);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Pressable accessibilityLabel="Retour" accessibilityRole="button" hitSlop={12} onPress={goBack} style={styles.backButton}>
          <Ionicons color="#123C2D" name="arrow-back" size={25} />
        </Pressable>

        <AppText variant="displayLg" style={styles.title}>VÉRIFICATION</AppText>
        <AppText style={styles.description}>
          Saisis le code de validation envoyé à{" "}
          <AppText style={styles.destination}>{maskEmail(pending.email)}</AppText>
        </AppText>

        <View style={styles.otpArea}>
          <OtpInput
            error={Boolean(error)}
            onChange={(value) => {
              setCode(value);
              setError(null);
            }}
            ref={input}
            value={code}
          />
        </View>

        {error ? <AppText color="danger" style={styles.error}>{error}</AppText> : null}

        <View style={styles.timerRow}>
          <Ionicons color="#65736D" name="time-outline" size={18} />
          <AppText style={styles.timer}>
            {remaining > 0 ? "Renvoyer le code dans 00:" + String(remaining).padStart(2, "0") : "Vous pouvez renvoyer le code"}
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: remaining > 0 || resend.isPending }}
          disabled={remaining > 0 || resend.isPending}
          onPress={() => resend.mutate()}
          style={styles.resendButton}
        >
          <AppText style={[styles.resend, remaining === 0 && styles.resendAvailable]}>
            {resend.isPending ? "Envoi…" : "Renvoyer le code"}
          </AppText>
        </Pressable>

        <Pressable
          accessibilityLabel="Valider"
          accessibilityRole="button"
          disabled={!isOtpComplete(code) || expired || verify.isPending}
          onPress={() => verify.mutate()}
          style={({ pressed }) => [styles.validateButton, pressed && styles.pressed]}
        >
          {verify.isPending ? <ActivityIndicator color="#FFFFFF" /> : <AppText style={styles.validateLabel}>Valider</AppText>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F7F6EF", flex: 1 },
  content: { flex: 1, paddingHorizontal: 24 },
  backButton: { alignItems: "flex-start", justifyContent: "center", marginTop: 38, minHeight: 44, width: 44 },
  title: { color: "#0A3828", fontSize: 42, lineHeight: 50, marginTop: 20 },
  description: { color: "#69766F", fontSize: 15, lineHeight: 20, marginTop: 2 },
  destination: { color: "#0D3A2B", fontSize: 15, fontWeight: "800" },
  otpArea: { marginTop: 33 },
  error: { fontSize: 13, marginTop: 8, textAlign: "center" },
  timerRow: { alignItems: "center", flexDirection: "row", gap: 5, justifyContent: "center", marginTop: 30 },
  timer: { color: "#65736D", fontSize: 14, fontWeight: "600" },
  resendButton: { alignItems: "center", justifyContent: "center", marginTop: 8, minHeight: 30 },
  resend: { color: "#A7B4AD", fontSize: 14, fontWeight: "600", textDecorationLine: "underline" },
  resendAvailable: { color: "#0D5135" },
  validateButton: {
    alignItems: "center",
    backgroundColor: "#0A3828",
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 19,
    minHeight: 53,
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  validateLabel: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
