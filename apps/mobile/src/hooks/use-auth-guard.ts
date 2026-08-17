import { useQuery } from "@tanstack/react-query";
import { router, usePathname, type Href } from "expo-router";
import { useEffect } from "react";

import { queryKeys, trpcClient } from "@/lib/trpc";
import { useAuthSession } from "./use-auth-session";
import { resolveAuthenticatedRoute } from "./auth-route";

const publicRoutes = new Set(["/", "/sign-in", "/otp"]);

export function useAuthGuard() {
  const pathname = usePathname();
  const auth = useAuthSession();
  const onboarding = useQuery({
    queryKey: queryKeys.onboarding,
    queryFn: () => trpcClient.user.getOnboardingStatus.query(),
    enabled: auth.isAuthenticated,
  });

  useEffect(() => {
    if (auth.isPending || auth.isError || (auth.isAuthenticated && (onboarding.isPending || onboarding.isError))) return;
    if (!auth.isAuthenticated) {
      if (!publicRoutes.has(pathname)) router.replace("/");
      return;
    }
    const target = resolveAuthenticatedRoute(pathname, onboarding.data?.nextStep ?? "NAME");
    if (pathname !== target) router.replace(target as Href);
  }, [auth.isAuthenticated, auth.isError, auth.isPending, onboarding.data?.nextStep, onboarding.isError, onboarding.isPending, pathname]);

  const target = auth.isAuthenticated ? resolveAuthenticatedRoute(pathname, onboarding.data?.nextStep ?? "NAME") : publicRoutes.has(pathname) ? pathname : "/";
  const isChecking = auth.isPending || (auth.isAuthenticated && onboarding.isPending) || pathname !== target;

  return {
    isChecking,
    hasError: auth.isError || (auth.isAuthenticated && onboarding.isError),
    retry: async () => {
      await auth.refetchSession();
      if (auth.isAuthenticated) await onboarding.refetch();
    },
  };
}
