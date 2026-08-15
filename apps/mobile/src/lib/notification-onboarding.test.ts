import { describe, expect, it, vi } from "vitest";
import { completeNotificationOnboarding, type NotificationOnboardingDependencies } from "./notification-onboarding";

const setup = (registration: { granted: boolean; subscriptionId: string | null }) => {
  const dependencies: NotificationOnboardingDependencies = {
    requestRegistration: vi.fn().mockResolvedValue(registration),
    registerDevice: vi.fn().mockResolvedValue(undefined),
    updatePreferences: vi.fn().mockResolvedValue(undefined),
    completeOnboarding: vi.fn().mockResolvedValue(undefined),
  };
  return dependencies;
};

describe("notification onboarding flow", () => {
  it("registers an authorized subscription before completing", async () => {
    const dependencies = setup({ granted: true, subscriptionId: "subscription_123" });
    await completeNotificationOnboarding({ askNativePermission: true, userId: "user_1", platform: "ios", dependencies });
    expect(dependencies.registerDevice).toHaveBeenCalledWith({ subscriptionId: "subscription_123", platform: "ios" });
    expect(dependencies.updatePreferences).toHaveBeenCalledWith(expect.objectContaining({ pushEnabled: true }));
    expect(dependencies.completeOnboarding).toHaveBeenCalledOnce();
  });

  it.each([
    ["permission refusée", true, "ios", { granted: false, subscriptionId: null }],
    ["OneSignal indisponible", true, "android", { granted: false, subscriptionId: null }],
    ["Plus tard", false, "ios", { granted: true, subscriptionId: "unused" }],
  ] as const)("finalizes with push disabled when %s", async (_case, askNativePermission, platform, registration) => {
    const dependencies = setup(registration);
    await completeNotificationOnboarding({ askNativePermission, userId: "user_1", platform, dependencies });
    expect(dependencies.updatePreferences).toHaveBeenCalledWith({ pushEnabled: false });
    expect(dependencies.completeOnboarding).toHaveBeenCalledOnce();
    if (!askNativePermission) expect(dependencies.requestRegistration).not.toHaveBeenCalled();
  });

  it("does not complete or navigate logically when preferences fail", async () => {
    const dependencies = setup({ granted: false, subscriptionId: null });
    vi.mocked(dependencies.updatePreferences).mockRejectedValueOnce(new Error("network"));
    await expect(completeNotificationOnboarding({ askNativePermission: false, userId: "user_1", platform: "ios", dependencies })).rejects.toThrow("network");
    expect(dependencies.completeOnboarding).not.toHaveBeenCalled();
  });

  it("surfaces completeOnboarding failures", async () => {
    const dependencies = setup({ granted: false, subscriptionId: null });
    vi.mocked(dependencies.completeOnboarding).mockRejectedValueOnce(new Error("ONBOARDING_STEP_REQUIRED"));
    await expect(completeNotificationOnboarding({ askNativePermission: false, userId: "user_1", platform: "ios", dependencies })).rejects.toThrow("ONBOARDING_STEP_REQUIRED");
  });
});
