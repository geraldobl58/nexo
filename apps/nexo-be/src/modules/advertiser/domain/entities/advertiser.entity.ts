import { AdvertiserType } from '../enums/advertiser-type.enum';
import { AdvertiserStatus } from '../enums/advertiser-status.enum';

/**
 * ENTIDADE DE DOMÍNIO: ADVERTISER (ANUNCIANTE)
 *
 * Representa quem pode publicar imóveis no portal.
 * Pode ser uma imobiliária, corretor, proprietário direto ou construtora.
 *
 * IMPORTANTE: esse tipo é independente do Prisma.
 * Não contém decorators de ORM, apenas tipos TypeScript puros.
 */
export interface AdvertiserEntity {
  // --- Identificação ---

  /** UUID gerado pelo banco */
  id: string;

  /**
   * ID do usuário no Keycloak (opcional).
   * Preenchido quando o anunciante cria conta autenticada.
   * Pode ser null para anunciantes cadastrados manualmente pela equipe.
   */
  keycloakId: string | null;

  // --- Tipo e status ---

  /** Categoria do anunciante (imobiliária, corretor, proprietário, construtora) */
  type: AdvertiserType;

  /** Estado atual no ciclo de vida (PENDING → ACTIVE → SUSPENDED/BLOCKED) */
  status: AdvertiserStatus;

  // --- Dados de contato ---

  /** Nome completo ou razão social */
  name: string;

  /** E-mail principal (único no sistema) */
  email: string;

  /** Telefone principal */
  phone: string;

  /** WhatsApp (opcional, pode ser diferente do telefone) */
  whatsapp: string | null;

  /** URL do avatar/foto de perfil */
  avatar: string | null;

  /** URL da imagem de capa do perfil */
  coverImage: string | null;

  // --- Dados profissionais (para AGENCY, BROKER, DEVELOPER) ---

  /** Razão social da empresa */
  companyName: string | null;

  /** Nome fantasia */
  tradeName: string | null;

  /** CNPJ ou CPF (único no sistema quando preenchido) */
  document: string | null;

  /** Número de registro CRECI (obrigatório para corretores e imobiliárias) */
  creci: string | null;

  /** Estado do CRECI (ex: 'SP', 'RJ') */
  creciState: string | null;

  // --- Endereço ---
  street: string | null;
  streetNumber: string | null;
  complement: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;

  // --- Perfil público ---

  /** Biografia/descrição para o perfil público */
  bio: string | null;

  // --- Redes sociais ---
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;

  // --- Verificação ---

  /** Indica se o anunciante foi verificado pela equipe interna */
  isVerified: boolean;

  /** Data em que foi verificado */
  verifiedAt: Date | null;

  // --- Controle de conta ---

  /** Data de suspensão (preenchida quando status = SUSPENDED) */
  suspendedAt: Date | null;

  /** Motivo da suspensão */
  suspendReason: string | null;

  /** Soft delete — null = ativo, preenchido = excluído */
  deletedAt: Date | null;

  // --- Timestamps ---
  createdAt: Date;
  updatedAt: Date;
}
