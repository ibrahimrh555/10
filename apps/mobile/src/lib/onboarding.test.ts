import { describe, expect, it } from "vitest";
import { isValidOnboardingName, normalizeOnboardingName, onboardingErrorMessage } from "./onboarding";

describe("mobile onboarding helpers", () => {
  it("starts from no fictional name and normalizes Unicode names", () => {
    expect(normalizeOnboardingName("")).toBe("");
    expect(normalizeOnboardingName("  إبراهم   الرحمٰني ")).toBe("إبراهم الرحمٰني");
  });

  it.each(["", "a", " ", "x".repeat(61)])("rejects invalid name %j", value => {
    expect(isValidOnboardingName(value)).toBe(false);
  });

  it.each(["Zoé", "李 雷", "Ibrahim Rahmani"])("accepts valid name %j", value => {
    expect(isValidOnboardingName(value)).toBe(true);
  });

  it("maps technical failures to French user-facing errors", () => {
    expect(onboardingErrorMessage(new Error("UNAUTHORIZED"))).toContain("session a expiré");
    expect(onboardingErrorMessage(new Error("Failed to fetch"))).toContain("connexion Internet");
    expect(onboardingErrorMessage(new Error("MIME mismatch"))).toContain("JPEG, PNG ou WebP");
    expect(onboardingErrorMessage(new Error("5 Mo"))).toContain("5 Mo");
    expect(onboardingErrorMessage(new Error("ONBOARDING_STEP_REQUIRED"))).toContain("informations sont manquantes");
  });
});
