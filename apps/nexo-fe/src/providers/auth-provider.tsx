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
import { syncMeAction } from "@/features/auth/actions/sync-me";

const KC_TOKEN_KEY = "kc_token";
const KC_REFRESH_KEY = "kc_refresh_token";
const KC_ID_KEY = "kc_id_token";

function saveTokens() {
  if (keycloak.token) sessionStorage.setItem(KC_TOKEN_KEY, keycloak.token);
  if (keycloak.refreshToken)
    sessionStorage.setItem(KC_REFRESH_KEY, keycloak.refreshToken);
  if (keycloak.idToken) sessionStorage.setItem(KC_ID_KEY, keycloak.idToken);
}

function clearTokens() {
  sessionStorage.removeItem(KC_TOKEN_KEY);
  sessionStorage.removeItem(KC_REFRESH_KEY);
  sessionStorage.removeItem(KC_ID_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Pre-set auth state from sessionStorage immediately after mount.
    // This happens synchronously before Keycloak init resolves, so the UI
    // shows the authenticated state without waiting for the network.
    // Note: this runs AFTER hydration, so no SSR mismatch.
    const hasStoredToken = !!sessionStorage.getItem(KC_TOKEN_KEY);
    if (hasStoredToken) {
      queryClient.setQueryData(AUTH_SESSION_KEY, {
        isAuthenticated: true,
        isLoading: false,
      });
    }

    const init = async () => {
      try {
        // Restore tokens from sessionStorage — avoids hidden iframe (check-sso)
        // which modern browsers block due to cross-origin cookie partitioning.
        const token = sessionStorage.getItem(KC_TOKEN_KEY) ?? undefined;
        const refreshToken =
          sessionStorage.getItem(KC_REFRESH_KEY) ?? undefined;
        const idToken = sessionStorage.getItem(KC_ID_KEY) ?? undefined;

        const authenticated = await keycloak.init({
          // If stored tokens exist, init without onLoad; Keycloak will validate /
          // refresh them automatically. Fall back to check-sso on first login.
          onLoad: token ? undefined : "check-sso",
          token,
          refreshToken,
          idToken,
          silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
          pkceMethod: "S256",
          checkLoginIframe: false,
        });

        if (authenticated) {
          saveTokens();

          // Keep sessionStorage tokens in sync after every refresh
          keycloak.onAuthRefreshSuccess = saveTokens;

          // If token expires and refresh also fails → force logout
          keycloak.onAuthRefreshError = async () => {
            clearTokens();
            await clearAuthCookie();
            queryClient.setQueryData(AUTH_SESSION_KEY, {
              isAuthenticated: false,
              isLoading: false,
            });
            keycloak.logout({ redirectUri: window.location.origin });
          };

          try {
            // Fetch full user data from API and persist to cookie
            const user = await syncMeAction(keycloak.token!);
            await setAuthCookie(user);
            queryClient.setQueryData(USER_QUERY_KEY, user);
          } catch (err) {
            console.error("Erro ao sincronizar usuário:", err);
          }

          // Proactively refresh token before expiry
          setInterval(async () => {
            try {
              const refreshed = await keycloak.updateToken(60);
              if (refreshed) saveTokens();
            } catch (error) {
              console.error("Erro ao atualizar token:", error);
              clearTokens();
              await clearAuthCookie();
              queryClient.setQueryData(AUTH_SESSION_KEY, {
                isAuthenticated: false,
                isLoading: false,
              });
              keycloak.logout({ redirectUri: window.location.origin });
            }
          }, 30000);
        } else {
          // Keycloak confirmed the session is gone — clear stale tokens
          clearTokens();
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
