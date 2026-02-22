import { useQuery, useQueryClient } from "@tanstack/react-query";
import keycloak from "@/lib/keycloak";
import { syncMeAction } from "../actions/sync-me";
import type { User } from "../types";

export const USER_QUERY_KEY = ["auth", "user"] as const;

function getUserFromCookie(): User | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/(?:^|;\s*)nexo-user=([^;]+)/);
  if (!match) return undefined;
  try {
    return JSON.parse(atob(match[1])) as User;
  } catch {
    return undefined;
  }
}

export function useUser(enabled: boolean) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: async () => {
      await keycloak.updateToken(30);
      return syncMeAction(keycloak.token!);
    },
    enabled,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    initialData: () => getUserFromCookie(),
    initialDataUpdatedAt: 0,
  });

  const refreshUserData = async () => {
    await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
  };

  return {
    user: query.data ?? null,
    isLoadingUser: query.isLoading,
    userError: query.error,
    refreshUserData,
  };
}
