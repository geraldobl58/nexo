"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import keycloak from "@/lib/keycloak";
import { useUser } from "./use-user";
import { clearAuthCookie } from "../actions/session";

interface AuthSession {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AUTH_SESSION_KEY = ["auth", "session"] as const;

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: session } = useQuery<AuthSession>({
    queryKey: AUTH_SESSION_KEY,
    queryFn: () => ({ isAuthenticated: false, isLoading: true }),
    enabled: false,
    // Must be static to match SSR — avoids hydration mismatch.
    // AuthProvider updates this client-side after mount.
    initialData: { isAuthenticated: false, isLoading: true },
  });

  const { isAuthenticated, isLoading } = session;
  const { user, refreshUserData } = useUser(isAuthenticated);

  const login = useCallback(async (redirectPath?: string) => {
    try {
      await keycloak.login({
        redirectUri: `${window.location.origin}${redirectPath ?? "/panel"}`,
      });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
  }, []);

  const logout = useCallback(async () => {
    // Clear persisted tokens so the next page load starts unauthenticated
    sessionStorage.removeItem("kc_token");
    sessionStorage.removeItem("kc_refresh_token");
    sessionStorage.removeItem("kc_id_token");
    queryClient.setQueryData(AUTH_SESSION_KEY, {
      isAuthenticated: false,
      isLoading: false,
    });
    await clearAuthCookie();
    keycloak.logout({
      redirectUri: window.location.origin,
    });
  }, [queryClient]);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUserData,
  };
}
