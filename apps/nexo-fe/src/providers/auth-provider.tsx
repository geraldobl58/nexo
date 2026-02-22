"use client";

import { useEffect, useRef, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import keycloak from "@/lib/keycloak";
import {
  setAuthCookie,
  clearAuthCookie,
} from "@/features/auth/actions/session";
import { AUTH_SESSION_KEY } from "@/features/auth/hooks/use-auth";
import { USER_QUERY_KEY } from "@/features/auth/hooks/use-user";

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
          silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        });

        if (authenticated) {
          const tokenParsed = keycloak.tokenParsed;
          const userData = tokenParsed
            ? {
                keycloakId: tokenParsed.sub ?? "",
                name:
                  (tokenParsed["name"] as string) ??
                  (tokenParsed["preferred_username"] as string) ??
                  "",
                email: (tokenParsed["email"] as string) ?? "",
                role:
                  (
                    tokenParsed["realm_access"] as
                      | { roles?: string[] }
                      | undefined
                  )?.roles?.[0] ?? "",
              }
            : undefined;

          await setAuthCookie(userData);

          if (userData) {
            queryClient.setQueryData(USER_QUERY_KEY, {
              id: "",
              ...userData,
              isActive: true,
            });
          }

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
