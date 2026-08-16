import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet } from "react-native";
import { AppButton, AppHeader, AppText, OtpInput, type OtpInputHandle, ScreenContainer, ScreenTitle } from "@/components/ui";
import { isOtpComplete } from "@/components/ui/otp";
import { theme } from "@/design-system";
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
  useEffect(() => { if (!hasPendingAuth) router.replace(signInRoute); }, [hasPendingAuth, pending.intent]);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
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
    onSuccess(nextStep) { pendingAuthStore.clearPendingAuth(); setCode(""); router.replace(nextRoute[nextStep]); },
    onError(rawError) { const message = rawError instanceof Error && rawError.message === "incomplete_otp" ? "Saisissez les six chiffres du code." : authErrorMessage(rawError as never, "verify"); setError(message); setCode(""); if ((rawError as { code?: string })?.code?.includes("EXPIRED")) setExpired(true); setTimeout(() => input.current?.focus(), 0); },
  });
  const resend = useMutation({
    mutationFn: async () => { if (!pending.email || remaining > 0) throw new Error("resend_unavailable"); const result = await authClient.emailOtp.sendVerificationOtp({ email: pending.email, type: "sign-in" }); if (result.error) throw result.error; },
    onSuccess() { if (!pending.email || !pending.intent) return; pendingAuthStore.setPendingAuth(pending.email, pending.cityId, pending.intent, Date.now()); setNow(Date.now()); setCode(""); setError(null); setExpired(false); Alert.alert("Code envoyé", "Un nouveau code vient de vous être envoyé."); },
    onError(rawError) { if (rawError instanceof Error && rawError.message === "resend_unavailable") return; Alert.alert("Code non envoyé", authErrorMessage(rawError as never, "send")); },
  });
  if (!hasPendingAuth || !pending.email) return null;
  return <ScreenContainer footer={<AppButton disabled={!isOtpComplete(code) || expired || verify.isPending} loading={verify.isPending} label="Vérifier le code" icon="arrow-forward" onPress={() => verify.mutate()} />}>
    <AppHeader onBack={() => { pendingAuthStore.clearPendingAuth(); setCode(""); router.replace(signInRoute); }} />
    <ScreenTitle dark="VÉRIFICATION" description={`Nous avons envoyé un code à ${maskEmail(pending.email)}`} />
    <OtpInput ref={input} value={code} error={Boolean(error)} onChange={value => { setCode(value); setError(null); }} />
    {error ? <AppText style={styles.error} color="danger">{error}</AppText> : null}
    <AppText style={styles.timer} color="textSecondary">{remaining > 0 ? `Renvoyer le code dans 00:${String(remaining).padStart(2, "0")}` : "Vous pouvez demander un nouveau code."}</AppText>
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: remaining > 0 || resend.isPending }} disabled={remaining > 0 || resend.isPending} onPress={() => resend.mutate()} style={styles.action}><AppText color={remaining > 0 ? "textSecondary" : "primary"}>Renvoyer le code</AppText></Pressable>
    <Pressable accessibilityRole="button" onPress={() => { setCode(""); router.replace(signInRoute); }} style={styles.action}><AppText color="primary">Modifier l’adresse e-mail</AppText></Pressable>
  </ScreenContainer>;
}

const styles = StyleSheet.create({ timer: { marginTop: theme.spacing.xl, textAlign: "center" }, error: { marginTop: theme.spacing.sm, textAlign: "center" }, action: { alignItems: "center", justifyContent: "center", minHeight: 44, marginTop: theme.spacing.sm } });
