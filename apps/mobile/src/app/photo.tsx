import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { apiUrl } from "@/lib/config";
import { onboardingErrorMessage, onboardingQueryKeys } from "@/lib/onboarding";
import { queryClient, trpcClient } from "@/lib/trpc";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
function inferredMime(uri: string) { const extension = uri.split(".").pop()?.toLocaleLowerCase(); if (extension === "png") return "image/png"; if (extension === "webp") return "image/webp"; return "image/jpeg"; }
async function invalidateUserData() { await Promise.all(onboardingQueryKeys.slice(0, 3).map(queryKey => queryClient.invalidateQueries({ queryKey }))); }

export default function PhotoScreen() {
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const upload = useMutation({
    mutationFn: async () => {
      if (!selectedImage) throw new Error("photo_required");
      const mimeType = selectedImage.mimeType ?? inferredMime(selectedImage.uri);
      if (selectedImage.fileSize && selectedImage.fileSize > MAX_PHOTO_BYTES) throw new Error("5 Mo");
      if (!allowedMimeTypes.has(mimeType)) throw new Error("format");
      const form = new FormData();
      form.append("file", { uri: selectedImage.uri, name: selectedImage.fileName ?? "profile." + (mimeType.split("/")[1] ?? "jpg"), type: mimeType } as unknown as Blob);
      const cookie = authClient.getCookie();
      const response = await fetch(apiUrl + "/api/assets/profile-photo", { method: "POST", body: form, ...(cookie ? { headers: { cookie } } : {}) });
      if (!response.ok) throw new Error(response.status === 401 ? "session" : "upload_" + response.status);
    },
    onSuccess: async () => { await invalidateUserData(); router.replace("/notifications-permission"); },
    onError: failure => setError(onboardingErrorMessage(failure, "Impossible d’envoyer la photo. Veuillez réessayer.")),
  });
  const skip = useMutation({
    mutationFn: () => trpcClient.user.skipProfilePhoto.mutate(),
    onSuccess: async () => { await invalidateUserData(); router.replace("/notifications-permission"); },
    onError: failure => setError(onboardingErrorMessage(failure, "Impossible de continuer. Veuillez réessayer.")),
  });
  const busy = upload.isPending || skip.isPending;
  const pickImage = async () => {
    if (busy) return;
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { setError("Autorisez l’accès à vos photos pour choisir une image."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) setSelectedImage(result.assets[0]);
  };
  const continueFlow = () => selectedImage ? upload.mutate() : void pickImage();

  return <SafeAreaView style={styles.safe}><View style={styles.content}>
    <Pressable accessibilityLabel="Retour" accessibilityRole="button" hitSlop={12} onPress={() => router.back()} style={styles.back}><Ionicons color="#123C2D" name="arrow-back" size={25} /></Pressable>
    <AppText variant="displayLg" style={styles.title}>AJOUTE TA PHOTO</AppText>
    <AppText style={styles.description}>Un profil avec photo inspire plus confiance pour{"\n"}organiser les matchs.</AppText>
    <Pressable accessibilityLabel="Choisir une photo" accessibilityRole="button" disabled={busy} onPress={() => void pickImage()} style={styles.avatarWrap}>
      {selectedImage ? <Image accessibilityLabel="Aperçu de la photo sélectionnée" source={{ uri: selectedImage.uri }} style={styles.avatar} /> : <View style={styles.placeholder}><Ionicons color="#596A62" name="person-outline" size={48} /></View>}
      <View style={styles.cameraBadge}><Ionicons color="#18E078" name="camera" size={17} /></View>
    </Pressable>
    {error ? <AppText color="danger" style={styles.error} variant="bodySm">{error}</AppText> : null}
    <Pressable accessibilityRole="button" disabled={busy} onPress={continueFlow} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>{upload.isPending ? <ActivityIndicator color="#FFFFFF" /> : <AppText style={styles.buttonLabel}>Choisir une photo</AppText>}</Pressable>
    <Pressable accessibilityRole="button" disabled={busy} onPress={() => { setError(null); skip.mutate(); }} style={styles.skip}><AppText style={styles.skipText}>{skip.isPending ? "Chargement…" : "Passer cette étape"}</AppText></Pressable>
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: "#F7F6EF", flex: 1 }, content: { alignItems: "center", flex: 1, paddingHorizontal: 24 },
  back: { alignItems: "flex-start", alignSelf: "flex-start", justifyContent: "center", marginTop: 38, minHeight: 44, width: 44 },
  title: { color: "#0A3828", fontSize: 39, lineHeight: 48, marginTop: 19, textAlign: "center" },
  description: { color: "#65736D", fontSize: 15.5, lineHeight: 21, marginTop: 1, textAlign: "center" },
  avatarWrap: { height: 140, marginTop: 44, position: "relative", width: 140 },
  placeholder: { alignItems: "center", backgroundColor: "#E3E0D5", borderRadius: 70, height: 130, justifyContent: "center", width: 130 },
  avatar: { borderRadius: 65, height: 130, width: 130 },
  cameraBadge: { alignItems: "center", backgroundColor: "#073B2B", borderColor: "#F7F6EF", borderRadius: 18, borderWidth: 3, bottom: 4, height: 36, justifyContent: "center", position: "absolute", right: 2, width: 36 },
  error: { marginTop: 8, textAlign: "center" },
  button: { alignItems: "center", alignSelf: "stretch", backgroundColor: "#0A3828", borderRadius: 12, justifyContent: "center", marginTop: 35, minHeight: 53 },
  buttonLabel: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" }, pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  skip: { alignItems: "center", minHeight: 44, paddingTop: 16 }, skipText: { color: "#5F6E67", fontSize: 14, fontWeight: "600", textDecorationLine: "underline" },
});
