import { describe, expect, it } from "vitest";

import { isOtpComplete, sanitizeOtp } from "./otp";

describe("OTP input", () => {
  it("conserve les six chiffres saisis par l’utilisateur", () => {
    expect(sanitizeOtp("123456")).toBe("123456");
  });

  it("accepte le collage d’un code contenant des espaces", () => {
    expect(sanitizeOtp("12 34 56")).toBe("123456");
  });

  it("ignore les caractères non numériques", () => {
    expect(sanitizeOtp("1a2-3b4 5x6")).toBe("123456");
  });

  it("limite la valeur à six chiffres", () => {
    expect(sanitizeOtp("123456789")).toBe("123456");
  });

  it("valide seulement un code complet de six chiffres", () => {
    expect(isOtpComplete("12345")).toBe(false);
    expect(isOtpComplete("123456")).toBe(true);
    expect(isOtpComplete("12345a")).toBe(false);
  });
});
