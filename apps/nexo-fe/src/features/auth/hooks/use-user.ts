import { useQuery, useQueryClient } from "@tanstack/react-query";
import keycloak from "@/lib/keycloak";
import { syncMeAction } from "../actions/sync-me";

const USER_QUERY_KEY = ["auth", "user"] as const;

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
