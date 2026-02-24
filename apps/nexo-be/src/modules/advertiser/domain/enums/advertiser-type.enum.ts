/**
 * ENUM: TIPO DE ANUNCIANTE
 *
 * Define quem está anunciando o imóvel no portal.
 *
 * Ciclo de uso:
 *   Registro → Aprovação → Publicação de anúncios
 *
 * Tipos disponíveis:
 *
 *  AGENCY    → Imobiliária (empresa com múltiplos corretores)
 *  BROKER    → Corretor independente (pessoa física com CRECI)
 *  OWNER     → Proprietário direto (dono do imóvel, sem intermediário)
 *  DEVELOPER → Construtora ou Incorporadora (lançamentos)
 */
export enum AdvertiserType {
  AGENCY = 'AGENCY',
  BROKER = 'BROKER',
  OWNER = 'OWNER',
  DEVELOPER = 'DEVELOPER',
}
