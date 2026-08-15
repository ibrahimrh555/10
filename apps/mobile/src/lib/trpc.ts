import type { AppRouter } from "@10in/api";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { QueryClient } from "@tanstack/react-query";

import { authClient } from "./auth-client";
import { apiUrl } from "./config";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
    mutations: { retry: false },
  },
});

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${apiUrl}/trpc`,
      headers() {
        const cookie = authClient.getCookie();
        return cookie ? { cookie } : {};
      },
    }),
  ],
});

export const queryKeys = {
  session: ["auth", "session"] as const,
  onboarding: ["user", "onboarding"] as const,
  currentUser: ["user", "current"] as const,
};
