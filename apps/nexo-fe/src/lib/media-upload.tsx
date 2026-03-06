// ---------------------------------------------------------------------------
// Tipos de plano (espelha o enum do backend)
// ---------------------------------------------------------------------------
export type ListingPlanType =
  | "FREE"
  | "STANDARD"
  | "FEATURED"
  | "PREMIUM"
  | "SUPER";

// ---------------------------------------------------------------------------
// Limites por plano
//
// MOCK: enquanto o módulo de pagamento não estiver disponível, novos imóveis
// são sempre criados como FREE. Os limites abaixo já estão preparados para os
// planos pagos quando forem implementados.
// ---------------------------------------------------------------------------

/** Plano FREE: máximo de 5 fotos */
export const MAX_IMAGES_FREE = 5;
/** Planos pagos: máximo de 10 fotos */
export const MAX_IMAGES_PAID = 10;

/**
 * Retorna o limite de imagens para o plano informado.
 * Quando o plano não for informado (ex.: wizard de criação), assume FREE.
 */
export function getMaxImages(plan?: ListingPlanType): number {
  return !plan || plan === "FREE" ? MAX_IMAGES_FREE : MAX_IMAGES_PAID;
}

// ---------------------------------------------------------------------------
// Manter compat. com código legado que importa MAX_IMAGES diretamente
// ---------------------------------------------------------------------------
/** @deprecated Use getMaxImages(plan) */
export const MAX_IMAGES = MAX_IMAGES_FREE;

export const MAX_VIDEOS = 2;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

export const ACCEPTED_TYPES: Record<string, "IMAGE" | "VIDEO"> = {
  "image/jpeg": "IMAGE",
  "image/png": "IMAGE",
  "image/webp": "IMAGE",
  "video/mp4": "VIDEO",
  "video/quicktime": "VIDEO", // .mov
  "video/avi": "VIDEO",
};

export const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.webp,.mp4,.mov,.avi";

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateFile(
  file: File,
  currentImages: number,
  currentVideos: number,
  maxImages: number = MAX_IMAGES_FREE,
): string | null {
  const mediaType = ACCEPTED_TYPES[file.type];

  if (!mediaType)
    return `"${file.name}": tipo não suportado. Use JPEG, PNG, WebP, MP4 ou MOV.`;

  if (mediaType === "IMAGE") {
    if (file.size > MAX_IMAGE_BYTES)
      return `"${file.name}": imagem excede o limite de 10 MB.`;
    if (currentImages >= maxImages)
      return `Limite de ${maxImages} fotos por imóvel atingido (plano atual).`;
  }

  if (mediaType === "VIDEO") {
    if (file.size > MAX_VIDEO_BYTES)
      return `"${file.name}": vídeo excede o limite de 100 MB.`;
    if (currentVideos >= MAX_VIDEOS)
      return `Limite de ${MAX_VIDEOS} vídeos por imóvel atingido.`;
  }

  return null;
}
