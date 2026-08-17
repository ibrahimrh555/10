export const onboardingStepRoute = { NAME: "/name", PHOTO: "/photo", NOTIFICATIONS: "/notifications-permission", COMPLETED: "/home" } as const;
export type OnboardingStep = keyof typeof onboardingStepRoute;

function isCompletedAppRoute(pathname: string) {
  return pathname === "/home" || pathname === "/explore" || pathname.startsWith("/games/");
}

export function resolveAuthenticatedRoute(pathname: string, nextStep: OnboardingStep) {
  if (nextStep === "COMPLETED" && isCompletedAppRoute(pathname)) return pathname;
  return onboardingStepRoute[nextStep];
}
