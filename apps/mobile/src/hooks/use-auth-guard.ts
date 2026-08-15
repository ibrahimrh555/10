import { useQuery } from "@tanstack/react-query";
import { router, usePathname } from "expo-router";
import { useEffect } from "react";

import { queryKeys, trpcClient } from "@/lib/trpc";
import { useAuthSession } from "./use-auth-session";

const publicRoutes = new Set(["/", "/sign-in", "/otp"]);
const stepRoute = { NAME: "/name", PHOTO: "/photo", NOTIFICATIONS: "/notifications-permission", COMPLETED: "/home" } as const;

export function useAuthGuard() {
  const pathname = usePathname();
  const auth = useAuthSession();
  const onboarding = useQuery({
    queryKey: queryKeys.onboarding,
    queryFn: () => trpcClient.user.getOnboardingStatus.query(),
    enabled: auth.isAuthenticated,
  });

  useEffect(() => {
    if (auth.isPending || (auth.isAuthenticated && onboarding.isPending)) return;
    if (!auth.isAuthenticated) {
      if (!publicRoutes.has(pathname)) router.replace("/");
      return;
    }
    const target = stepRoute[onboarding.data?.nextStep ?? "NAME"];
    if (pathname !== target) router.replace(target);
  }, [auth.isAuthenticated, auth.isPending, onboarding.data?.nextStep, onboarding.isPending, pathname]);
}
