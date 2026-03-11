import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteMedia,
  listMedia,
  reorderMedia,
  uploadMedia,
} from "../services/publish.service";
import type { MediaOrderItem } from "../types/publish.type";

export const MEDIA_QUERY_KEY = (propertyId: string) =>
  ["media", propertyId] as const;

export function useListMedia(propertyId: string | undefined) {
  return useQuery({
    queryKey: MEDIA_QUERY_KEY(propertyId ?? ""),
    queryFn: () => listMedia(propertyId!),
    enabled: !!propertyId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUploadMedia(propertyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadMedia(propertyId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MEDIA_QUERY_KEY(propertyId) });
    },
  });
}

export function useDeleteMedia(propertyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mediaId: string) => deleteMedia(propertyId, mediaId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MEDIA_QUERY_KEY(propertyId) });
    },
  });
}

export function useReorderMedia(propertyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: MediaOrderItem[]) => reorderMedia(propertyId, items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MEDIA_QUERY_KEY(propertyId) });
    },
  });
}
