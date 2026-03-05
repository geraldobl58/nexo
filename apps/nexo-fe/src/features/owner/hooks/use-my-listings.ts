"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { useAuth } from "@/features/auth";
import keycloak from "@/lib/keycloak";
import { getMyListingById, getMyListings } from "../http/my-listings";
import {
  createListing,
  deleteListing,
  publishListing,
  reactivateListing,
  unpublishListing,
  updateListing,
} from "../actions/my-listings";
import {
  CreatePublishInput,
  MyListingsQueryParams,
  UpdateListingInput,
} from "../types/publish-types";

export const MY_LISTINGS_KEY = (
  userId: string,
  params: MyListingsQueryParams,
) => ["owner", "my-listings", userId, params] as const;

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
 * Retorna a lista paginada dos imóveis do usuário logado.
 *
 * - Retorna todos os status por padrão (DRAFT, ACTIVE, INACTIVE, SOLD, RENTED).
 * - Aguarda o Keycloak estar autenticado antes de disparar a requisição,
 *   evitando condição de corrida entre o cache react-query e o keycloak.init().
 * - O dono só enxerga seus próprios imóveis — isolamento garantido pelo backend.
 *
 * @param params - Filtros opcionais (status, page, limit)
 */
export function useMyListings(params: MyListingsQueryParams = {}) {
  const { user, isAuthenticated } = useAuth();
  const keycloakAuthenticated = useSyncExternalStore(
    subscribeToKeycloak,
    getKeycloakAuth,
    () => false, // server snapshot
  );

  const query = useQuery({
    queryKey: MY_LISTINGS_KEY(user?.id ?? "", params),
    queryFn: () => getMyListings(params),
    enabled: isAuthenticated && keycloakAuthenticated && !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 min
  });

  return {
    listings: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? 1,
    limit: query.data?.limit ?? 20,
    totalPages: query.data?.totalPages ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Retorna os dados de um imóvel do usuário logado pelo ID.
 *
 * @param id - UUID do imóvel (undefined desabilita a query)
 */
export function useMyListingById(id: string | undefined) {
  const { user, isAuthenticated } = useAuth();
  const keycloakAuthenticated = useSyncExternalStore(
    subscribeToKeycloak,
    getKeycloakAuth,
    () => false,
  );

  const query = useQuery({
    queryKey: ["owner", "my-listings", user?.id ?? "", id],
    queryFn: () => getMyListingById(id!),
    enabled: isAuthenticated && keycloakAuthenticated && !!user?.id && !!id,
    staleTime: 2 * 60 * 1000,
  });

  return {
    listing: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Mutation para criar um novo imóvel (POST — status DRAFT).
 * Invalida automaticamente o cache de listagem após sucesso.
 */
export function useCreateMyListing() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: CreatePublishInput) => createListing(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["owner", "my-listings", user?.id ?? ""],
      });
    },
  });
}

/**
 * Mutation para atualizar um imóvel (PATCH semântico).
 * Invalida automaticamente o cache de listagem após sucesso.
 */
export function useUpdateMyListing() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateListingInput }) =>
      updateListing(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["owner", "my-listings", user?.id ?? ""],
      });
    },
  });
}

/**
 * Mutation para excluir um imóvel (soft delete).
 * Invalida automaticamente o cache de listagem após sucesso.
 */
export function useDeleteMyListing() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: string) => deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["owner", "my-listings", user?.id ?? ""],
      });
    },
  });
}

/**
 * Mutation para publicar um imóvel (DRAFT → ACTIVE).
 * Invalida automaticamente o cache de listagem após sucesso.
 */
export function usePublishMyListing() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: string) => publishListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["owner", "my-listings", user?.id ?? ""],
      });
    },
  });
}

/**
 * Mutation para despublicar um imóvel (ACTIVE → INACTIVE).
 * Invalida automaticamente o cache de listagem após sucesso.
 */
export function useUnpublishMyListing() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: string) => unpublishListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["owner", "my-listings", user?.id ?? ""],
      });
    },
  });
}

/**
 * Mutation para reativar um imóvel (INACTIVE → ACTIVE).
 * Invalida automaticamente o cache de listagem após sucesso.
 */
export function useReactivateMyListing() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: string) => reactivateListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["owner", "my-listings", user?.id ?? ""],
      });
    },
  });
}
