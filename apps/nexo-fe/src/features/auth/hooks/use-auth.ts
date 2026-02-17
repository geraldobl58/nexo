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
    initialData: { isAuthenticated: false, isLoading: true },
  });

  const { isAuthenticated, isLoading } = session;
  const { user, refreshUserData } = useUser(isAuthenticated);

  const login = useCallback(async () => {
    try {
      await keycloak.login({
        redirectUri: `${window.location.origin}/panel`,
      });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
  }, []);

  const logout = useCallback(async () => {
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
