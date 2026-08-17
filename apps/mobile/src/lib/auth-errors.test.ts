import { describe, expect, it } from "vitest";
import { authErrorMessage, maskEmail } from "./auth-errors";

describe("auth error presentation", () => {
  it("masque l'adresse sans masquer le domaine", () => { expect(maskEmail("player@example.com")).toBe("pl****@example.com"); });
  it("distingue un code incorrect", () => { expect(authErrorMessage({ code: "INVALID_OTP" }, "verify")).toContain("incorrect"); });
  it("distingue un code expiré", () => { expect(authErrorMessage({ code: "OTP_EXPIRED" }, "verify")).toContain("expiré"); });
  it("présente les limites de débit sans message technique", () => { expect(authErrorMessage({ status: 429 }, "send")).toContain("Trop de demandes"); });
  it("présente les erreurs réseau", () => { expect(authErrorMessage({ message: "Failed to fetch" }, "send")).toContain("réseau"); });
  it("indique quand aucun compte ne correspond à l'e-mail", () => { expect(authErrorMessage({ code: "ACCOUNT_NOT_FOUND", status: 404 }, "send")).toContain("Aucun compte"); });
});
