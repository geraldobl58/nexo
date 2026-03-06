/**
 * ENTIDADE DE DOMÍNIO: MÍDIA DO ANÚNCIO
 *
 * Representa uma foto ou vídeo vinculado a um imóvel.
 * Armazenado no Cloudinary; persiste URL + publicId + order no banco.
 *
 * Mapeamento com o model `PropertyMedia` do schema Prisma.
 */
export type MediaType = 'IMAGE' | 'VIDEO';

export interface MediaEntity {
  /** UUID gerado pelo banco */
  id: string;

  /** UUID do imóvel ao qual esta mídia pertence */
  propertyId: string;

  /** Tipo: imagem ou vídeo */
  type: MediaType;

  /** URL pública do Cloudinary (CDN) */
  url: string;

  /**
   * Cloudinary public_id.
   * Necessário para deletar o asset via API do Cloudinary.
   * Formato: "nexo/properties/{propertyId}/{filename}"
   */
  publicId: string;

  /**
   * Posição na galeria (0 = primeira / capa).
   * Ordenação controlada pelo use-case de reorder.
   */
  order: number;

  createdAt: Date;
}
