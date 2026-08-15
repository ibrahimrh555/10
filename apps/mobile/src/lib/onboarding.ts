export const normalizeOnboardingName = (value: string) => value.trim().replace(/\s+/gu, " ");

export const isValidOnboardingName = (value: string) => {
  const normalized = normalizeOnboardingName(value);
  return normalized.length >= 2 && normalized.length <= 60;
};

export function onboardingErrorMessage(error: unknown, fallback = "Une erreur est survenue. Veuillez réessayer."): string {
  const message = error instanceof Error ? error.message : "";
  const normalized = message.toLocaleLowerCase("fr");
  if (normalized.includes("unauthorized") || normalized.includes("authentification") || normalized.includes("session")) return "Votre session a expiré. Veuillez vous reconnecter.";
  if (normalized.includes("5 mo") || normalized.includes("too large") || normalized.includes("taille")) return "La photo ne doit pas dépasser 5 Mo.";
  if (normalized.includes("mime") || normalized.includes("format") || normalized.includes("image non autorisé")) return "Choisissez une image JPEG, PNG ou WebP.";
  if (normalized.includes("network") || normalized.includes("fetch") || normalized.includes("connexion")) return "Vérifiez votre connexion Internet puis réessayez.";
  if (normalized.includes("onboarding_") || normalized.includes("conflict")) return "Certaines informations sont manquantes. Veuillez réessayer.";
  return fallback;
}

export const onboardingQueryKeys = [
  ["auth", "session"],
  ["user", "onboarding"],
  ["user", "current"],
  ["notifications", "preferences"],
] as const;
