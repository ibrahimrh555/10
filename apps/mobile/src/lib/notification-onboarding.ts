export interface NotificationOnboardingDependencies {
  requestRegistration(userId: string): Promise<{ granted: boolean; subscriptionId: string | null }>;
  registerDevice(input: { subscriptionId: string; platform: "ios" | "android" }): Promise<unknown>;
  updatePreferences(input: { pushEnabled: boolean; gameInvitationsEnabled?: boolean; gameRemindersEnabled?: boolean; chatMessagesEnabled?: boolean; circleUpdatesEnabled?: boolean }): Promise<unknown>;
  completeOnboarding(): Promise<unknown>;
}

export async function completeNotificationOnboarding(options: { askNativePermission: boolean; userId: string; platform: "ios" | "android" | "unsupported"; dependencies: NotificationOnboardingDependencies }): Promise<void> {
  const { askNativePermission, dependencies, platform, userId } = options;
  let pushEnabled = false;
  if (askNativePermission && platform !== "unsupported") {
    const registration = await dependencies.requestRegistration(userId);
    if (registration.granted && registration.subscriptionId) {
      await dependencies.registerDevice({ subscriptionId: registration.subscriptionId, platform });
      pushEnabled = true;
    }
  }
  await dependencies.updatePreferences(pushEnabled ? { pushEnabled: true, gameInvitationsEnabled: true, gameRemindersEnabled: true, chatMessagesEnabled: true, circleUpdatesEnabled: true } : { pushEnabled: false });
  await dependencies.completeOnboarding();
}
