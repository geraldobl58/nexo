import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ListingEntity } from '../../../domain/entities/marketing.entity';
import { ListingStatus } from '../../../domain/enums/marketing-status.enum';
import { MediaResponseDto } from './media-response.dto';

/**
 * DTO DE RESPOSTA — ANÚNCIO
 *
 * Por que ter um DTO de resposta separado da entidade de domínio?
 *
 * 1. Controle do que é exposto na API:
 *    - A entidade de domínio pode ter campos internos (deletedAt, etc.)
 *      que não devemos expor ao cliente.
 *
 * 2. Transformações de apresentação:
 *    - Preço em centavos no banco → podemos exibir em reais na API.
 *    - Ou formatar datas de forma diferente.
 *
 * 3. Documentação automática:
 *    - @ApiProperty gera o schema no Swagger UI com exemplos reais.
 *
 * Por ora, expomos a maioria dos campos da entidade.
 * Em uma versão futura, poderíamos criar diferentes "views" para
 * diferentes perfis (admin vê tudo, público vê menos).
 */
export class ListingResponseDto {
  @ApiProperty({ example: 'c56a4180-65aa-42ec-a945-5fd21dec0538' })
  id: string;

  @ApiPropertyOptional({
    description: 'ID de integração com portal externo',
    example: 'vr-12345678',
  })
  externalId: string | null;

  @ApiPropertyOptional({
    description: 'ID do anunciante dono do anúncio',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  advertiserId: string;

  @ApiProperty({ enum: ListingStatus, example: ListingStatus.ACTIVE })
  status: ListingStatus;

  @ApiProperty({ enum: ['RENT', 'SALE'], example: 'SALE' })
  purpose: string;

  @ApiProperty({ example: 'APARTMENT' })
  type: string;

  @ApiProperty({
    example: 'Apartamento 3 quartos com vista para o mar no Guarujá',
  })
  title: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty({
    description: 'Preço em centavos. R$ 350.000 = 35000000',
    example: 35000000,
  })
  price: number;

  @ApiPropertyOptional({ example: 80000 })
  condominiumFee: number | null;

  @ApiPropertyOptional({ example: 360000 })
  iptuYearly: number | null;

  // --- Localização ---

  @ApiProperty({ example: 'São Paulo' })
  city: string;

  @ApiProperty({ example: 'SP' })
  state: string;

  @ApiProperty({ example: 'Pinheiros' })
  district: string;

  @ApiPropertyOptional()
  street: string | null;

  @ApiPropertyOptional()
  streetNumber: string | null;

  @ApiPropertyOptional()
  complement: string | null;

  @ApiPropertyOptional()
  zipcode: string | null;

  @ApiPropertyOptional({ example: -23.5617 })
  latitude: number | null;

  @ApiPropertyOptional({ example: -46.6559 })
  longitude: number | null;

  // --- Características físicas ---

  @ApiPropertyOptional({ example: 85 })
  areaM2: number | null;

  @ApiPropertyOptional({ example: 75 })
  builtArea: number | null;

  @ApiPropertyOptional({ example: 3 })
  bedrooms: number | null;

  @ApiPropertyOptional({ example: 1 })
  suites: number | null;

  @ApiPropertyOptional({ example: 2 })
  bathrooms: number | null;

  @ApiPropertyOptional({ example: 1 })
  garageSpots: number | null;

  @ApiPropertyOptional()
  floor: number | null;

  @ApiPropertyOptional()
  totalFloors: number | null;

  @ApiPropertyOptional()
  furnished: boolean | null;

  @ApiPropertyOptional()
  petFriendly: boolean | null;

  @ApiPropertyOptional()
  yearBuilt: number | null;

  // --- Contato específico do anúncio ---

  @ApiPropertyOptional({ example: 'João da Silva' })
  contactName: string | null;

  @ApiPropertyOptional({ example: 'joao@imobiliaria.com.br' })
  contactEmail: string | null;

  @ApiPropertyOptional({ example: '+5511999999999' })
  contactPhone: string | null;

  @ApiPropertyOptional({ example: '+5511999999999' })
  contactWhatsApp: string | null;

  // --- Negociação ---

  @ApiProperty({ example: false })
  acceptsExchange: boolean;

  @ApiProperty({ example: true })
  acceptsFinancing: boolean;

  @ApiProperty({ example: false })
  acceptsCarTrade: boolean;

  @ApiProperty({ example: false })
  isLaunch: boolean;

  @ApiProperty({ example: false })
  isReadyToMove: boolean;

  // --- SEO e URLs ---

  @ApiProperty({
    description: 'URL amigável do anúncio',
    example: 'apartamento-3-quartos-guaruja-x7k2m9',
  })
  slug: string;

  @ApiPropertyOptional()
  metaTitle: string | null;

  @ApiPropertyOptional()
  metaDescription: string | null;

  @ApiPropertyOptional({
    description: 'URL de vídeo ou tour virtual',
    example: 'https://www.youtube.com/watch?v=abc123',
  })
  videoUrl: string | null;

  @ApiPropertyOptional({
    description: 'URL de tour virtual imersivo 360°',
    example: 'https://my.matterport.com/show/?m=abc123',
  })
  virtualTourUrl: string | null;

  // --- Analytics ---

  @ApiProperty({ example: 1240 })
  viewsCount: number;

  @ApiProperty({ example: 930 })
  uniqueViewsCount: number;

  @ApiProperty({ example: 15 })
  leadsCount: number;

  @ApiProperty({ example: 42 })
  favoritesCount: number;

  @ApiProperty({ example: 8 })
  sharesCount: number;

  @ApiProperty({ example: 20 })
  phoneClicksCount: number;

  @ApiProperty({ example: 35 })
  whatsappClicksCount: number;

  @ApiProperty({ example: 5 })
  emailClicksCount: number;

  // --- Plano e destaque ---

  @ApiProperty({ example: false })
  isFeatured: boolean;

  @ApiPropertyOptional()
  highlightUntil: Date | null;

  // --- Avaliações ---

  @ApiPropertyOptional({ example: 4.7 })
  averageRating: number | null;

  @ApiProperty({ example: 12 })
  totalReviews: number;

  // --- Integração com portais ---

  @ApiProperty({ example: false })
  publishToVivaReal: boolean;

  @ApiProperty({ example: false })
  publishToOLX: boolean;

  @ApiProperty({ example: false })
  publishToZapImoveis: boolean;

  // --- Controle ---

  @ApiPropertyOptional()
  publishedAt: Date | null;

  @ApiPropertyOptional()
  expiresAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Fotos e vídeos do imóvel, ordenados por posição na galeria',
    type: [MediaResponseDto],
  })
  media?: MediaResponseDto[];

  /**
   * Factory estático: converte ListingEntity → ListingResponseDto.
   *
   * Por que um factory estático?
   * Mantém a lógica de conversão centralizada no DTO.
   * O controller chama `ListingResponseDto.fromEntity(listing)` e pronto.
   */
  static fromEntity(entity: ListingEntity): ListingResponseDto {
    const dto = new ListingResponseDto();
    Object.assign(dto, entity);
    // Remove campo interno (não expor ao cliente)
    delete (dto as Partial<ListingResponseDto & { deletedAt?: unknown }>)
      .deletedAt;
    // Mapeia mídias se presentes (só disponíveis no detalhe)
    if (entity.media) {
      dto.media = entity.media.map(MediaResponseDto.fromEntity);
    }
    return dto;
  }
}

/**
 * DTO DE RESPOSTA PAGINADA
 *
 * Envolve a lista de anúncios com metadados de paginação.
 * O front-end usa `totalPages` para saber quantos botões de página exibir.
 */
export class PaginatedListingResponseDto {
  @ApiProperty({ type: [ListingResponseDto] })
  items: ListingResponseDto[];

  @ApiProperty({ example: 150, description: 'Total de anúncios encontrados' })
  total: number;

  @ApiProperty({ example: 1, description: 'Página atual' })
  page: number;

  @ApiProperty({ example: 20, description: 'Itens por página' })
  limit: number;

  @ApiProperty({ example: 8, description: 'Total de páginas disponíveis' })
  totalPages: number;
}
