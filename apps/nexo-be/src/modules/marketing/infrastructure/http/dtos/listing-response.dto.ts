import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ListingEntity } from '../../../domain/entities/listing.entity';
import { ListingStatus } from '../../../domain/enums/listing-status.enum';

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

  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
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

  @ApiProperty({
    description: 'URL amigável do anúncio',
    example: 'apartamento-3-quartos-guaruja-x7k2m9',
  })
  slug: string;

  @ApiPropertyOptional()
  metaTitle: string | null;

  @ApiPropertyOptional()
  metaDescription: string | null;

  @ApiPropertyOptional()
  publishedAt: Date | null;

  @ApiPropertyOptional()
  expiresAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

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
