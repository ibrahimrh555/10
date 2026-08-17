import { describe, expect, it } from "vitest";
import { resolveAuthenticatedRoute } from "./auth-route";

describe("navigation après onboarding", () => {
  it("autorise exploration lorsque l’onboarding est terminé", () => expect(resolveAuthenticatedRoute("/explore", "COMPLETED")).toBe("/explore"));
  it("autorise le détail d’un match", () => expect(resolveAuthenticatedRoute("/games/club-atlas", "COMPLETED")).toBe("/games/club-atlas"));
  it("conserve l’accueil comme repli", () => expect(resolveAuthenticatedRoute("/route-inconnue", "COMPLETED")).toBe("/home"));
  it("continue d’imposer l’étape d’onboarding active", () => expect(resolveAuthenticatedRoute("/explore", "PHOTO")).toBe("/photo"));
});
