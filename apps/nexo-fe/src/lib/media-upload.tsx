// ---------------------------------------------------------------------------
// Limites espelhados do backend (upload-marketing-media.use-case.ts)
// ---------------------------------------------------------------------------
export const MAX_IMAGES = 20;
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
): string | null {
  const mediaType = ACCEPTED_TYPES[file.type];

  if (!mediaType)
    return `"${file.name}": tipo não suportado. Use JPEG, PNG, WebP, MP4 ou MOV.`;

  if (mediaType === "IMAGE") {
    if (file.size > MAX_IMAGE_BYTES)
      return `"${file.name}": imagem excede o limite de 10 MB.`;
    if (currentImages >= MAX_IMAGES)
      return `Limite de ${MAX_IMAGES} imagens por imóvel atingido.`;
  }

  if (mediaType === "VIDEO") {
    if (file.size > MAX_VIDEO_BYTES)
      return `"${file.name}": vídeo excede o limite de 100 MB.`;
    if (currentVideos >= MAX_VIDEOS)
      return `Limite de ${MAX_VIDEOS} vídeos por imóvel atingido.`;
  }

  return null;
}
