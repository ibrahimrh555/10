type AuthError = { code?: string; message?: string; status?: number; statusCode?: number } | null | undefined;

export function authErrorMessage(error: AuthError, context: "send" | "verify"): string {
  const code = error?.code?.toUpperCase() ?? "";
  const status = error?.status ?? error?.statusCode;
  if (code.includes("ACCOUNT_NOT_FOUND") || status === 404) return "Aucun compte ne correspond à cette adresse e-mail.";
  if (status === 429 || code.includes("RATE") || code.includes("TOO_MANY")) return context === "send" ? "Trop de demandes. Patientez avant de réessayer." : "Trop de tentatives. Demandez un nouveau code.";
  if (code.includes("EXPIRED")) return "Ce code a expiré. Demandez-en un nouveau.";
  if (code.includes("INVALID_OTP") || code.includes("INVALID_CODE")) return "Le code saisi est incorrect.";
  if (error?.message?.toLowerCase().includes("network") || error?.message?.toLowerCase().includes("fetch")) return "Erreur réseau. Vérifiez votre connexion.";
  return context === "send" ? "Connexion indisponible. Réessayez dans un instant." : "Impossible de vérifier le code pour le moment.";
}

export function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(2, local.length - visible.length))}@${domain}`;
}
