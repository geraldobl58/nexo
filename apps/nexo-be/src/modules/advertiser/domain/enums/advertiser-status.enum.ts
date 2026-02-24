/**
 * ENUM: STATUS DO ANUNCIANTE
 *
 * Ciclo de vida de um anunciante no portal:
 *
 *  ┌─────────┐  aprovação   ┌────────┐
 *  │ PENDING │ ───────────► │ ACTIVE │
 *  └─────────┘              └────────┘
 *                               │
 *              suspensão        │  suspensão
 *              temporária       │  permanente
 *              ▼                ▼
 *         ┌──────────┐    ┌─────────┐
 *         │ SUSPENDED│    │ BLOCKED │
 *         └──────────┘    └─────────┘
 *
 *  PENDING   → Aguardando revisão/aprovação da equipe interna
 *  ACTIVE    → Pode publicar anúncios normalmente
 *  SUSPENDED → Suspenso temporariamente (pode ser reativado)
 *  BLOCKED   → Bloqueado permanentemente (violação grave)
 */
export enum AdvertiserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
}
