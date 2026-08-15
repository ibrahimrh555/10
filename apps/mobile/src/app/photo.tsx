import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";

import { AppButton, AppHeader, AppText, Avatar, ProgressIndicator, ScreenContainer, ScreenTitle } from "@/components/ui";
import { theme } from "@/design-system";
import { authClient } from "@/lib/auth-client";
import { apiUrl } from "@/lib/config";
import { onboardingErrorMessage, onboardingQueryKeys } from "@/lib/onboarding";
import { queryClient, trpcClient } from "@/lib/trpc";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function inferredMime(uri: string): string {
  const extension = uri.split(".").pop()?.toLocaleLowerCase();
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  return "image/jpeg";
}

async function invalidateUserData() {
  await Promise.all(onboardingQueryKeys.slice(0, 3).map(queryKey => queryClient.invalidateQueries({ queryKey })));
}

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
      form.append("file", { uri: selectedImage.uri, name: selectedImage.fileName ?? `profile.${mimeType.split("/")[1] ?? "jpg"}`, type: mimeType } as unknown as Blob);
      const cookie = authClient.getCookie();
      const response = await fetch(`${apiUrl}/api/assets/profile-photo`, { method: "POST", body: form, ...(cookie ? { headers: { cookie } } : {}) });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(response.status === 401 ? "session" : payload?.message ?? `upload_${response.status}`);
      }
    },
    onSuccess: async () => { await invalidateUserData(); router.replace("/notifications-permission"); },
    onError: failure => setError(onboardingErrorMessage(failure, failure instanceof Error && failure.message === "photo_required" ? "Choisissez une photo avant de continuer." : "Impossible d’envoyer la photo. Veuillez réessayer.")),
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
    if (!permission.granted) {
      setError("Autorisez l’accès à vos photos pour choisir une image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) setSelectedImage(result.assets[0]);
  };

  return (
    <ScreenContainer footer={<View style={styles.footer}><AppButton disabled={!selectedImage || busy} loading={upload.isPending} label="Continuer" icon="arrow-forward" onPress={() => upload.mutate()} /><AppButton disabled={busy} loading={skip.isPending} label="Plus tard" variant="secondary" onPress={() => { setError(null); skip.mutate(); }} /></View>}>
      <AppHeader />
      <ProgressIndicator step={2} />
      <ScreenTitle dark="Ajoutez" accent="une photo" description="Ajoutez une photo pour permettre aux autres joueurs de vous reconnaître." />
      {selectedImage ? <Image accessibilityLabel="Aperçu de la photo sélectionnée" source={{ uri: selectedImage.uri }} style={styles.preview} /> : <Avatar />}
      <View style={styles.actions}>
        <AppButton disabled={busy} label="Choisir une photo" icon="image-outline" variant="secondary" onPress={() => { void pickImage(); }} />
        {error ? <AppText color="danger" variant="bodySm" style={styles.error}>{error}</AppText> : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: { gap: theme.spacing.xs, marginTop: theme.spacing.xl },
  error: { textAlign: "center" },
  footer: { gap: theme.spacing.sm },
  preview: { alignSelf: "center", borderColor: theme.colors.primary, borderRadius: theme.radius.full, borderWidth: 3, height: 160, width: 160 },
});
