"use client";

import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { useAuth } from "@/features/auth";
import keycloak from "@/lib/keycloak";
import { getMyListingsCount } from "../http/dashboard";

export const MY_LISTINGS_COUNT_KEY = (userId: string) =>
  ["dashboard", "listings-count", userId] as const;

/**
 * Subscrição ao estado do Keycloak para que o React re-renderize
 * quando `keycloak.authenticated` muda de false → true.
 */
function subscribeToKeycloak(callback: () => void) {
  keycloak.onAuthSuccess = callback;
  keycloak.onAuthRefreshSuccess = callback;
  return () => {
    keycloak.onAuthSuccess = undefined;
    keycloak.onAuthRefreshSuccess = undefined;
  };
}

function getKeycloakAuth() {
  return keycloak.authenticated ?? false;
}

/**
 * Retorna o total de anúncios do usuário logado (todos os status).
 * Aguarda o Keycloak estar de fato autenticado antes de disparar as requisições,
 * evitando a condição de corrida entre o cache react-query e o keycloak.init().
 */
export function useMyListingsCount() {
  const { user, isAuthenticated } = useAuth();
  const keycloakAuthenticated = useSyncExternalStore(
    subscribeToKeycloak,
    getKeycloakAuth,
    () => false, // server snapshot
  );

  const query = useQuery({
    queryKey: MY_LISTINGS_COUNT_KEY(user?.id ?? ""),
    queryFn: () => getMyListingsCount(),
    enabled: isAuthenticated && keycloakAuthenticated && !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 min
  });

  return {
    count: query.data ?? 0,
    isLoading: query.isLoading,
    error: query.error,
  };
}
