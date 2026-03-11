/**
 * PLANO DE ASSINATURA DO ANUNCIANTE
 *
 * Espelha o enum `PlanType` do Prisma — mantemos uma cópia no domínio
 * para que essa camada permaneça independente de infraestrutura.
 *
 * Regras:
 *   BASIC        → gratuito, 1 imóvel, 5 fotos, sem vídeo
 *   INTERMEDIATE → R$ 49,90/mês, até 5 imóveis, 10 fotos, 1 vídeo
 *   PREMIUM      → R$ 99,90/mês, ilimitado, 10 fotos, 1 vídeo
 */
export enum ListingPlan {
  /** Básico — gratuito (1 imóvel, 5 fotos, sem vídeo) */
  BASIC = 'BASIC',

  /** Intermediário — R$ 49,90/mês (5 imóveis, 10 fotos, 1 vídeo) */
  INTERMEDIATE = 'INTERMEDIATE',

  /** Premium — R$ 99,90/mês (ilimitado, 10 fotos, 1 vídeo) */
  PREMIUM = 'PREMIUM',
}
