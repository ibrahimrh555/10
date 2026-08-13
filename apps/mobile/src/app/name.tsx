import { router } from "expo-router";
import { useState } from "react";

import {
  AppButton,
  AppHeader,
  AppTextInput,
  ProgressIndicator,
  ScreenContainer,
  ScreenTitle,
} from "@/components/ui";

export default function NameScreen() {
  const [name, setName] = useState("Ibrahim Rahmani");

  return (
    <ScreenContainer
      footer={
        <AppButton
          disabled={name.trim().length < 2}
          label="Continuer"
          icon="arrow-forward"
          onPress={() => router.push("/photo")}
        />
      }
    >
      <AppHeader />
      <ProgressIndicator step={1} />
      <ScreenTitle
        dark="Comment vous"
        accent="appelez-vous ?"
        description="Votre nom apparaîtra sur votre profil et dans vos matchs."
      />
      <AppTextInput
        autoCapitalize="words"
        label="Nom complet"
        onChangeText={setName}
        value={name}
      />
    </ScreenContainer>
  );
}
