import { afterEach, describe, expect, it } from "vitest";
import { pendingAuthStore } from "./pending-auth-store";

describe("pending auth store", () => {
  afterEach(() => pendingAuthStore.clearPendingAuth());
  it("normalise et conserve seulement les données nécessaires", () => {
    pendingAuthStore.setPendingAuth(" PLAYER@Example.COM ", "city-1", "signup", 123);
    expect(pendingAuthStore.getState()).toEqual({ email: "player@example.com", cityId: "city-1", intent: "signup", requestedAt: 123 });
    expect(pendingAuthStore.getState()).not.toHaveProperty("otp");
  });
  it("efface les données temporaires", () => {
    pendingAuthStore.setPendingAuth("a@b.com", null, "login", 123);
    expect(pendingAuthStore.getState()).toEqual({ email: "a@b.com", cityId: null, intent: "login", requestedAt: 123 });
    pendingAuthStore.clearPendingAuth();
    expect(pendingAuthStore.getState()).toEqual({ email: null, cityId: null, intent: null, requestedAt: null });
  });
});
