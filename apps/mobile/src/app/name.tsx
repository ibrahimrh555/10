import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/ui";
import { isValidOnboardingName, normalizeOnboardingName, onboardingErrorMessage, onboardingQueryKeys } from "@/lib/onboarding";
import { queryClient, trpcClient } from "@/lib/trpc";

export default function NameScreen() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const normalizedName = normalizeOnboardingName(name);
  const mutation = useMutation({
    mutationFn: () => trpcClient.user.updateName.mutate({ name: normalizedName }),
    onSuccess: async () => {
      await Promise.all(onboardingQueryKeys.slice(0, 3).map(queryKey => queryClient.invalidateQueries({ queryKey })));
      router.replace("/photo");
    },
    onError: failure => setError(onboardingErrorMessage(failure, "Impossible d’enregistrer votre nom. Veuillez réessayer.")),
  });
  const submit = () => {
    if (!isValidOnboardingName(name) || mutation.isPending) return;
    Keyboard.dismiss();
    setError(null);
    mutation.mutate();
  };
  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}><View style={styles.content}>
    <Pressable accessibilityLabel="Retour" accessibilityRole="button" hitSlop={12} onPress={() => router.back()} style={styles.back}><Ionicons color="#123C2D" name="arrow-back" size={25} /></Pressable>
    <AppText variant="displayLg" style={styles.title}>COMMENT TU T’APPELLES ?</AppText>
    <AppText style={styles.description}>Aide tes futurs coéquipiers à te reconnaître sur le{"\n"}terrain.</AppText>
    <View style={styles.form}><AppText style={styles.label}>Nom Complet</AppText><TextInput autoCapitalize="words" maxLength={80} onChangeText={value => { setName(value); if (error) setError(null); }} placeholder="Youssef Ayoubi" placeholderTextColor="#173B2D" style={[styles.input, error && styles.inputError]} value={name} />{error ? <AppText color="danger" variant="bodySm">{error}</AppText> : null}</View>
    <Pressable accessibilityRole="button" disabled={!isValidOnboardingName(name) || mutation.isPending} onPress={submit} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>{mutation.isPending ? <ActivityIndicator color="#FFFFFF" /> : <AppText style={styles.buttonLabel}>Continuer</AppText>}</Pressable>
  </View></KeyboardAvoidingView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: "#F7F6EF", flex: 1 }, flex: { flex: 1 }, content: { flex: 1, paddingHorizontal: 24 },
  back: { alignItems: "flex-start", justifyContent: "center", marginTop: 38, minHeight: 44, width: 44 },
  title: { color: "#0A3828", fontSize: 28, lineHeight: 49, marginTop: 19 },
  description: { color: "#65736D", fontSize: 14.5, lineHeight: 20, marginTop: 58 },
  form: { gap: 9, marginTop: 31 }, label: { color: "#173B2D", fontSize: 14, fontWeight: "700" },
  input: { backgroundColor: "#FFFFFF", borderColor: "#DDDCD4", borderRadius: 12, borderWidth: 1, color: "#173B2D", fontSize: 16, minHeight: 52, paddingHorizontal: 16 },
  inputError: { borderColor: "#FF3B3F" },
  button: { alignItems: "center", backgroundColor: "#0A3828", borderRadius: 12, justifyContent: "center", marginTop: 24, minHeight: 53 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] }, buttonLabel: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
