/**
 * STATUS DE UM ANÚNCIO IMOBILIÁRIO
 *
 * Em DDD (Domain-Driven Design), enums de domínio vivem aqui, na camada
 * de domínio, porque representam regras de negócio — não detalhes técnicos.
 *
 * Ciclo de vida de um anúncio:
 *
 *   Criação ──► DRAFT ──► (publicar) ──► ACTIVE
 *                                           │
 *                              ┌────────────┴─────────────┐
 *                              ▼                          ▼
 *                           INACTIVE                  SOLD / RENTED
 *
 * Nota: esse enum espelha o PropertyStatus do Prisma.
 * Mantemos uma cópia no domínio para que a camada de domínio NÃO dependa
 * diretamente do Prisma (um detalhe de infraestrutura).
 */
export enum ListingStatus {
  /** Rascunho: criado pelo anunciante, invisível no portal */
  DRAFT = 'DRAFT',

  /** Publicado: visível nas buscas e para compradores/inquilinos */
  ACTIVE = 'ACTIVE',

  /** Pausado: o anunciante retirou temporariamente do ar */
  INACTIVE = 'INACTIVE',

  /** Vendido: negócio de compra concluído */
  SOLD = 'SOLD',

  /** Alugado: negócio de locação concluído */
  RENTED = 'RENTED',
}
