import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Keyboard } from "react-native";

import { AppButton, AppHeader, AppText, AppTextInput, ProgressIndicator, ScreenContainer, ScreenTitle } from "@/components/ui";
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

  return (
    <ScreenContainer footer={<AppButton disabled={!isValidOnboardingName(name)} loading={mutation.isPending} label="Continuer" icon="arrow-forward" onPress={submit} />}>
      <AppHeader />
      <ProgressIndicator step={1} />
      <ScreenTitle dark="Comment vous" accent="appelez-vous ?" description="Votre nom apparaîtra sur votre profil et dans vos matchs." />
      <AppTextInput autoCapitalize="words" label="Nom complet" maxLength={80} onChangeText={value => { setName(value); if (error) setError(null); }} value={name} />
      {error ? <AppText color="danger" variant="bodySm">{error}</AppText> : null}
    </ScreenContainer>
  );
}
