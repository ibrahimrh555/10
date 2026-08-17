import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Alert, Keyboard, Pressable, StyleSheet, View } from "react-native";
import { z } from "zod";

import { AppButton, AppHeader, AppText, AppTextInput, ScreenContainer, ScreenTitle } from "@/components/ui";
import { theme } from "@/design-system";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { trpcClient } from "@/lib/trpc";
import { pendingAuthStore } from "@/stores/pending-auth-store";

const emailSchema = z.string().trim().toLowerCase().email("Saisissez une adresse e-mail valide.");
const signupSchema = z.object({ email: emailSchema, cityId: z.string().min(1, "Choisissez une ville.") });
const loginSchema = z.object({ email: emailSchema, cityId: z.string().optional().default("") });
type FormValues = { email: string; cityId: string };
type City = { id: string; name: string; countryCode: string };

export default function SignInScreen() {
  const params = useLocalSearchParams<{ intent?: string }>();
  const intent = params.intent === "login" ? "login" : "signup";
  const isSignup = intent === "signup";
  const pending = pendingAuthStore.getState();
  const sameIntent = pending.intent === intent;
  const { setValue, watch, setError, formState: { errors } } = useForm<FormValues>({ defaultValues: { email: sameIntent ? pending.email ?? "" : "", cityId: isSignup && sameIntent ? pending.cityId ?? "" : "" } });
  const email = watch("email");
  const cityId = watch("cityId");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => { const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300); return () => clearTimeout(timer); }, [search]);
  const cities = useQuery({ queryKey: ["cities", debouncedSearch], queryFn: () => debouncedSearch ? trpcClient.cities.search.query({ search: debouncedSearch }) : trpcClient.cities.list.query(), enabled: isSignup });
  const rows = (cities.data?.cities ?? []) as City[];
  const schema = isSignup ? signupSchema : loginSchema;
  const valid = useMemo(() => schema.safeParse({ email, cityId }).success, [cityId, email, schema]);
  const sendOtp = useMutation({
    mutationFn: async (values: FormValues) => { const result = await authClient.emailOtp.sendVerificationOtp({ email: values.email, type: "sign-in", intent } as Parameters<typeof authClient.emailOtp.sendVerificationOtp>[0] & { intent: "login" | "signup" }); if (result.error) throw result.error; return values; },
    onSuccess(values) { pendingAuthStore.setPendingAuth(values.email, isSignup ? values.cityId : null, intent, Date.now()); router.push("/otp"); },
    onError(error) { if (__DEV__) console.warn("email_otp_request_failed", { category: "request_failed" }); Alert.alert("Code non envoyé", authErrorMessage(error as never, "send")); },
  });
  const submit = () => {
    if (sendOtp.isPending) return;
    const parsed = schema.safeParse({ email, cityId });
    if (!parsed.success) { for (const issue of parsed.error.issues) setError(issue.path[0] as keyof FormValues, { message: issue.message }); return; }
    Keyboard.dismiss(); sendOtp.mutate(parsed.data);
  };

  return <ScreenContainer footer={<AppButton disabled={!valid || sendOtp.isPending} loading={sendOtp.isPending} label="Recevoir le code" icon="arrow-forward" onPress={submit} />}>
    <AppHeader /><ScreenTitle dark={isSignup ? "INSCRIPTION" : "CONNEXION"} />
    <View style={styles.segment}>
      <Pressable accessibilityRole="tab" accessibilityState={{ disabled: true, selected: false }} onPress={() => Alert.alert("Bientôt disponible", "Connexion par téléphone bientôt disponible")} style={styles.segmentItem}><AppText>Téléphone</AppText></Pressable>
      <View accessibilityRole="tab" accessibilityState={{ selected: true }} style={[styles.segmentItem, styles.activeSegment]}><AppText color="textInverse">E-mail</AppText></View>
    </View>
    <AppTextInput autoCapitalize="none" autoCorrect={false} icon="mail-outline" keyboardType="email-address" label="Adresse e-mail" {...(errors.email?.message ? { error: errors.email.message } : {})} onChangeText={value => setValue("email", value, { shouldValidate: true })} placeholder="vous@exemple.com" value={email} />
    {isSignup ? <View style={styles.citySection}>
      <AppText variant="headingSm">Où jouez-vous ?</AppText><AppText variant="bodySm" color="textSecondary">Choisissez votre ville.</AppText>
      <AppTextInput icon="search-outline" onChangeText={setSearch} placeholder="Rechercher une ville" value={search} {...(errors.cityId?.message ? { error: errors.cityId.message } : {})} />
      {cities.isPending ? <ActivityIndicator accessibilityLabel="Chargement des villes" color={theme.colors.primary} /> : cities.isError ? <View style={styles.feedback}><AppText color="danger">Impossible de charger les villes.</AppText><AppButton variant="secondary" label="Réessayer" onPress={() => void cities.refetch()} /></View> : <View style={styles.cityList}>{rows.map(city => {
        const selected = cityId === city.id;
        return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} key={city.id} onPress={() => setValue("cityId", city.id, { shouldValidate: true })} style={[styles.cityRow, selected && styles.cityRowSelected]}><AppText>{city.name}</AppText><Ionicons name={selected ? "radio-button-on" : "radio-button-off"} size={theme.sizes.icon.md} color={selected ? theme.colors.primary : theme.colors.textPrimary} /></Pressable>;
      })}</View>}
    </View> : null}
    <AppText variant="bodySm" color="textSecondary" style={styles.legal}>En continuant, vous acceptez nos Conditions d’utilisation et notre Politique de confidentialité.</AppText>
  </ScreenContainer>;
}

const styles = StyleSheet.create({ segment: { borderColor: theme.colors.border, borderRadius: theme.radius.md, borderWidth: 1, flexDirection: "row", marginBottom: theme.spacing.xl, padding: theme.spacing.xxs }, segmentItem: { alignItems: "center", borderRadius: theme.radius.sm, flex: 1, justifyContent: "center", minHeight: 44 }, activeSegment: { backgroundColor: theme.colors.surfaceBrand }, citySection: { gap: theme.spacing.xs, marginTop: theme.spacing.xl }, cityList: { gap: theme.spacing.xs }, cityRow: { alignItems: "center", backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSubtle, borderRadius: theme.radius.md, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 48, paddingHorizontal: theme.spacing.md }, cityRowSelected: { borderColor: theme.colors.primary, borderWidth: 2 }, feedback: { gap: theme.spacing.sm }, legal: { marginTop: theme.spacing.xl } });
