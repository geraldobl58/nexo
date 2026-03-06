/**
 * PLANO DO ANÚNCIO
 *
 * Define a visibilidade e os benefícios do anúncio no portal.
 * Espelha o enum `ListingPlanType` do Prisma — mantemos uma cópia
 * no domínio para que essa camada permaneça independente de infraestrutura.
 *
 * Hierarquia de planos (crescente em visibilidade):
 *   FREE → STANDARD → FEATURED → PREMIUM → SUPER
 */
export enum ListingPlan {
  /** Gratuito: básico, sem destaque */
  FREE = 'FREE',

  /** Padrão: listagem normal com mais fotos */
  STANDARD = 'STANDARD',

  /** Destaque: aparece no topo dos resultados de busca */
  FEATURED = 'FEATURED',

  /** Premium: múltiplas fotos + tour virtual */
  PREMIUM = 'PREMIUM',

  /** Super Destaque: homepage, cor especial, máxima visibilidade */
  SUPER = 'SUPER',
}
