"use client";

import { useEffect, useRef, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import keycloak from "@/lib/keycloak";
import {
  setAuthCookie,
  clearAuthCookie,
} from "@/features/auth/actions/session";
import { AUTH_SESSION_KEY } from "@/features/auth/hooks/use-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: "check-sso",
          pkceMethod: "S256",
          silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        });

        if (authenticated) {
          await setAuthCookie();

          setInterval(async () => {
            try {
              await keycloak.updateToken(60);
            } catch (error) {
              console.error("Erro ao atualizar token:", error);
              queryClient.setQueryData(AUTH_SESSION_KEY, {
                isAuthenticated: false,
                isLoading: false,
              });
              await clearAuthCookie();
              keycloak.logout({ redirectUri: window.location.origin });
            }
          }, 30000);
        }

        queryClient.setQueryData(AUTH_SESSION_KEY, {
          isAuthenticated: authenticated,
          isLoading: false,
        });
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
        queryClient.setQueryData(AUTH_SESSION_KEY, {
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    init();
  }, [queryClient]);

  return <>{children}</>;
}
