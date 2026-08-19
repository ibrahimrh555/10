import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import appLogo from "@/assets/images/app-logo-transparent.png";
import { AppText } from "@/components/ui";
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

function normalizeCity(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("fr");
}

export default function SignInScreen() {
  const params = useLocalSearchParams<{ intent?: string }>();
  const intent = params.intent === "login" ? "login" : "signup";
  const isSignup = intent === "signup";
  const pending = pendingAuthStore.getState();
  const sameIntent = pending.intent === intent;
  const { control, setValue, watch, setError, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      email: sameIntent ? pending.email ?? "" : "",
      cityId: isSignup && sameIntent ? pending.cityId ?? "" : "",
    },
  });
  const email = watch("email");
  const cityId = watch("cityId");
  const [citySearch, setCitySearch] = useState("");
  const [cityOpen, setCityOpen] = useState(false);

  const cities = useQuery({
    queryKey: ["cities", "MA"],
    queryFn: () => trpcClient.cities.list.query({ countryCode: "MA" }),
    enabled: isSignup,
  });
  const rows = useMemo(() => {
    const needle = normalizeCity(citySearch);
    const available = (cities.data?.cities ?? []) as City[];
    return needle ? available.filter((city) => normalizeCity(city.name).includes(needle)) : available;
  }, [cities.data?.cities, citySearch]);
  const schema = isSignup ? signupSchema : loginSchema;
  const valid = useMemo(() => schema.safeParse({ email, cityId }).success, [cityId, email, schema]);

  const sendOtp = useMutation({
    mutationFn: async (values: FormValues) => {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: values.email,
        type: "sign-in",
        intent,
      } as Parameters<typeof authClient.emailOtp.sendVerificationOtp>[0] & { intent: "login" | "signup" });
      if (result.error) throw result.error;
      return values;
    },
    onSuccess(values) {
      pendingAuthStore.setPendingAuth(values.email, isSignup ? values.cityId : null, intent, Date.now());
      router.push("/otp");
    },
    onError(error) {
      if (__DEV__) console.warn("email_otp_request_failed", { category: "request_failed" });
      Alert.alert("Code non envoyé", authErrorMessage(error as never, "send"));
    },
  });

  const submit = () => {
    if (sendOtp.isPending) return;
    const parsed = schema.safeParse({ email, cityId });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setError(issue.path[0] as keyof FormValues, { message: issue.message });
      }
      return;
    }
    Keyboard.dismiss();
    sendOtp.mutate(parsed.data);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoBlock}>
            <Image accessibilityIgnoresInvertColors accessibilityLabel="Logo 10in" resizeMode="contain" source={appLogo} style={styles.logo} />
            <View style={styles.logoUnderline} />
            <AppText style={styles.tagline}>FOOTBALL AMATEUR MAROC</AppText>
          </View>

          <View style={styles.headingBlock}>
            <AppText variant="displayMd" style={styles.title}>PRÊT À FOULER LE TERRAIN ?</AppText>
            <AppText style={styles.subtitle}>Connecte-toi pour rejoindre des matchs près de{"\n"}chez toi.</AppText>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <AuthField
                  autoCapitalize="none"
                  error={errors.email?.message}
                  icon="mail-outline"
                  keyboardType="email-address"
                  label="Adresse E-mail"
                  onChangeText={onChange}
                  placeholder="vous@gmail.com"
                  value={value}
                />
              )}
            />

            {isSignup ? (
              <View>
                <AuthField
                  error={errors.cityId?.message}
                  icon="location-outline"
                  label="Ville"
                  onChangeText={(value) => {
                    setCitySearch(value);
                    setValue("cityId", "", { shouldValidate: true });
                    setCityOpen(true);
                  }}
                  onFocus={() => setCityOpen(true)}
                  placeholder="Errachidia"
                  value={citySearch}
                />
                {cities.isFetching ? <View style={styles.searchStatus}><ActivityIndicator color={theme.colors.surfaceBrand} size="small" /><AppText color="textSecondary" variant="bodySm">Recherche des villes…</AppText></View> : null}
                {cities.isError && cityOpen ? <Pressable accessibilityRole="button" onPress={() => void cities.refetch()} style={styles.searchStatus}><Ionicons color={theme.colors.danger} name="refresh-outline" size={18} /><AppText color="danger" variant="bodySm">Impossible de charger les villes. Réessayer</AppText></Pressable> : null}
                {cityOpen && !cities.isFetching && !cities.isError && rows.length === 0 ? <View style={styles.searchStatus}><AppText color="textSecondary" variant="bodySm">Aucune ville trouvée.</AppText></View> : null}
                {cityOpen && rows.length > 0 && !cityId ? (
                  <View style={styles.cityResults}>
                    {rows.slice(0, 4).map((city) => (
                      <Pressable
                        accessibilityRole="button"
                        key={city.id}
                        onPress={() => {
                          setCitySearch(city.name);
                          setValue("cityId", city.id, { shouldValidate: true });
                          setCityOpen(false);
                        }}
                        style={styles.cityResult}
                      >
                        <AppText>{city.name}</AppText>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          <Pressable
            accessibilityLabel="Continuer"
            accessibilityRole="button"
            disabled={!valid || sendOtp.isPending}
            onPress={submit}
            style={({ pressed }) => [styles.continueButton, pressed && styles.pressed, (!valid || sendOtp.isPending) && styles.buttonDisabled]}
          >
            {sendOtp.isPending ? <ActivityIndicator color="#FFFFFF" /> : <AppText style={styles.continueLabel}>Continuer</AppText>}
          </Pressable>

          <AppText style={styles.legal}>
            En continuant, vous acceptez nos{" "}
            <AppText style={styles.legalLink}>Conditions d’utilisation</AppText>
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type AuthFieldProps = {
  autoCapitalize?: "none";
  error?: string | undefined;
  icon: keyof typeof Ionicons.glyphMap;
  keyboardType?: "email-address";
  label: string;
  onChangeText: (value: string) => void;
  onFocus?: (() => void) | undefined;
  placeholder: string;
  value: string;
};

function AuthField({ error, icon, label, ...inputProps }: AuthFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <AppText style={styles.fieldLabel}>{label}</AppText>
      <View style={[styles.field, error && styles.fieldError]}>
        <Ionicons color="#23352E" name={icon} size={26} />
        <TextInput
          {...inputProps}
          autoCorrect={false}
          placeholderTextColor="#9AA8A1"
          style={styles.input}
        />
      </View>
      {error ? <AppText color="danger" variant="bodySm">{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F7F6EF", flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 28, paddingHorizontal: 24 },
  logoBlock: { alignItems: "flex-start", marginTop: 54 },
  logo: { height: 96, marginLeft: 12, width: 170 },
  logoUnderline: { backgroundColor: "#20D978", borderRadius: 4, height: 5, marginLeft: 72, marginTop: -1, width: 40 },
  tagline: { color: "#59675F", fontSize: 12.5, fontWeight: "700", marginTop: 7 },
  headingBlock: { alignItems: "center", marginTop: 42 },
  title: { color: "#0A3828", fontSize: 27, lineHeight: 37, textAlign: "center" },
  subtitle: { color: "#617068", fontSize: 14.5, lineHeight: 19, marginTop: 3, textAlign: "center" },
  form: { gap: 17, marginTop: 48 },
  fieldGroup: { gap: 10 },
  fieldLabel: { color: "#173B2D", fontSize: 14, fontWeight: "700" },
  field: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#123D2D",
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: "row",
    minHeight: 54,
    paddingHorizontal: 16,
  },
  fieldError: { borderColor: theme.colors.danger },
  input: { color: "#173B2D", flex: 1, fontSize: 16, minHeight: 52, paddingHorizontal: 14 },
  searchStatus: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    minHeight: 38,
    paddingHorizontal: 12,
  },
  cityResults: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D7DDD8",
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
    overflow: "hidden",
  },
  cityResult: { borderBottomColor: "#E8ECE9", borderBottomWidth: 1, minHeight: 44, paddingHorizontal: 16, paddingVertical: 11 },
  continueButton: {
    alignItems: "center",
    backgroundColor: "#0B3829",
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 48,
    minHeight: 53,
  },
  buttonDisabled: { opacity: 0.62 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  continueLabel: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  legal: { color: "#9AABA3", fontSize: 12, marginTop: 43, textAlign: "center" },
  legalLink: { color: "#193C30", fontSize: 12, textDecorationLine: "underline" },
});
