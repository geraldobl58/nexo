import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ListingEntity } from '../../../domain/entities/marketing.entity';

// Listas de valores aceitos pelos enums (reutilizadas em @IsEnum e @ApiProperty)
const PURPOSE_VALUES: ListingEntity['purpose'][] = ['RENT', 'SALE'];
const TYPE_VALUES: ListingEntity['type'][] = [
  'APARTMENT',
  'HOUSE',
  'CONDO_HOUSE',
  'STUDIO',
  'LAND',
  'COMMERCIAL',
  'FARM',
  'OTHER',
];

/**
 * DTO DE QUERY PARAMS PARA BUSCA DE ANÚNCIOS
 *
 * Usado como parâmetros de URL na rota GET /listings.
 *
 * Exemplos de uso:
 *   GET /listings?purpose=RENT&city=São Paulo&minBedrooms=2
 *   GET /listings?type=APARTMENT&state=SP&maxPrice=50000000&furnished=true
 *   GET /listings?acceptsFinancing=true&minAreaM2=60&page=2&limit=10
 *
 * Por que usar @Type(() => Number)?
 *   Query strings chegam como TEXTO. @Type(() => Number) converte
 *   automaticamente "2" para o número 2. Requer `transform: true` no
 *   ValidationPipe (configurado em main.ts).
 *
 * Por que usar @Transform para booleanos?
 *   Query strings também chegam como texto para booleanos: "true" ≠ true.
 *   O @Transform converte a string para boolean antes da validação.
 */
export class GetListingsQueryDto {
  // ─── Classificação ────────────────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Finalidade: aluguel (RENT) ou venda (SALE)',
    enum: PURPOSE_VALUES,
    example: 'SALE',
  })
  @IsOptional()
  @IsEnum(PURPOSE_VALUES)
  purpose?: ListingEntity['purpose'];

  @ApiPropertyOptional({
    description: 'Tipo do imóvel',
    enum: TYPE_VALUES,
    example: 'APARTMENT',
  })
  @IsOptional()
  @IsEnum(TYPE_VALUES)
  type?: ListingEntity['type'];

  // ─── Localização ──────────────────────────────────────────────────────────

  @ApiPropertyOptional({
    description:
      'Cidade (busca parcial, sem diferenciar maiúsculas/minúsculas)',
    example: 'São Paulo',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Sigla do estado (ex: SP, RJ)',
    example: 'SP',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description:
      'Bairro (busca parcial, sem diferenciar maiúsculas/minúsculas)',
    example: 'Pinheiros',
  })
  @IsOptional()
  @IsString()
  district?: string;

  // ─── Preço ────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Preço mínimo em centavos. Ex: R$ 300.000 = 30000000',
    example: 10000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Preço máximo em centavos. Ex: R$ 800.000 = 80000000',
    example: 80000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  // ─── Quartos e banheiros ──────────────────────────────────────────────────

  @ApiPropertyOptional({ description: 'Número mínimo de quartos', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minBedrooms?: number;

  @ApiPropertyOptional({ description: 'Número máximo de quartos', example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxBedrooms?: number;

  @ApiPropertyOptional({
    description: 'Número mínimo de banheiros',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minBathrooms?: number;

  @ApiPropertyOptional({
    description: 'Número mínimo de vagas de garagem',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minGarageSpots?: number;

  // ─── Área ─────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({ description: 'Área total mínima em m²', example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minAreaM2?: number;

  @ApiPropertyOptional({ description: 'Área total máxima em m²', example: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxAreaM2?: number;

  // ─── Características booleanas ────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Apenas imóveis mobiliados',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  furnished?: boolean;

  @ApiPropertyOptional({
    description: 'Apenas imóveis que aceitam pets',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  petFriendly?: boolean;

  @ApiPropertyOptional({
    description: 'Apenas imóveis que aceitam financiamento',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  acceptsFinancing?: boolean;

  @ApiPropertyOptional({
    description: 'Apenas imóveis que aceitam permuta/troca',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  acceptsExchange?: boolean;

  @ApiPropertyOptional({
    description: 'Apenas imóveis na planta / lançamentos',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isLaunch?: boolean;

  @ApiPropertyOptional({ description: 'Apenas imóveis prontos para morar' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isReadyToMove?: boolean;

  @ApiPropertyOptional({ description: 'Apenas anúncios em destaque' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;

  // ─── Status ───────────────────────────────────────────────────────────────

  @ApiPropertyOptional({
    description:
      'Status do anúncio. Por padrão retorna apenas ACTIVE. ' +
      'Use DRAFT para ver rascunhos (requer ser o dono do anúncio).',
    enum: [
      'DRAFT',
      'ACTIVE',
      'PAUSED',
      'SOLD',
      'RENTED',
      'EXPIRED',
      'REJECTED',
    ],
    example: 'DRAFT',
  })
  @IsOptional()
  @IsString()
  status?: string;

  // ─── Anunciante ───────────────────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Filtrar anúncios de um anunciante específico',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsOptional()
  @IsUUID()
  advertiserId?: string;

  // ─── Paginação ────────────────────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Número da página (começa em 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Itens por página (máximo: 100)',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
