import { useQuery } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import { queryClient, queryKeys } from "@/lib/trpc";

export function useAuthSession() {
  const query = useQuery({
    queryKey: queryKeys.session,
    queryFn: async () => {
      const result = await authClient.getSession();
      if (result.error) throw result.error;
      return result.data;
    },
  });

  return {
    session: query.data?.session ?? null,
    user: query.data?.user ?? null,
    isPending: query.isPending,
    isAuthenticated: Boolean(query.data?.session),
    refetchSession: query.refetch,
    signOut: async () => {
      await authClient.signOut();
      queryClient.clear();
    },
  };
}
