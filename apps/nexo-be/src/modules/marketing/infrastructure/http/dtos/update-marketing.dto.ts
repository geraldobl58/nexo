import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { ListingEntity } from '../../../domain/entities/marketing.entity';

/**
 * DTO DE ATUALIZAÇÃO DE ANÚNCIO
 *
 * Todos os campos são opcionais — o cliente envia apenas o que deseja alterar (PATCH semântico).
 * A validação ocorre campo a campo: se um campo não for enviado, não é validado nem alterado.
 *
 * Campos de controle que NÃO são editáveis aqui:
 *  - status  → gerenciado por /publish e /unpublish
 *  - slug    → regerado automaticamente quando o título muda
 *  - analytics (viewsCount, leadsCount, etc.) → incrementados por eventos
 *  - publishedAt, deletedAt, expiresAt → controlados por use-cases específicos
 */
export class UpdateListingDto {
  // --- Conteúdo ---

  @ApiPropertyOptional({
    description: 'Novo título do anúncio (entre 10 e 150 caracteres)',
    example: 'Apartamento 3 quartos reformado em Pinheiros',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada atualizada',
  })
  @IsOptional()
  @IsString()
  description?: string;

  // --- Valores ---

  @ApiPropertyOptional({
    description: 'Novo preço em centavos. R$ 350.000 = 35000000',
    example: 37000000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  price?: number;

  @ApiPropertyOptional({
    description: 'Taxa de condomínio mensal em centavos',
    example: 90000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  condominiumFee?: number;

  @ApiPropertyOptional({
    description: 'IPTU anual em centavos',
    example: 400000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  iptuYearly?: number;

  // --- Localização ---

  @ApiPropertyOptional({ example: 'Campinas' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'SP' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: 'Cambuí' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  streetNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zipcode?: string;

  @ApiPropertyOptional({ example: -22.9056 })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: -47.0608 })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  // --- Características físicas ---

  @ApiPropertyOptional({ example: 95 })
  @IsOptional()
  @IsInt()
  @Min(1)
  areaM2?: number;

  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsInt()
  @Min(1)
  builtArea?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  suites?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  garageSpots?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(0)
  floor?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalFloors?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  furnished?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  petFriendly?: boolean;

  @ApiPropertyOptional({ example: 2020 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 5)
  yearBuilt?: number;

  // --- Contato específico do anúncio ---

  @ApiPropertyOptional({ example: 'Maria Oliveira' })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ example: 'maria@imob.com.br' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ example: '+5511988887777' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ example: '+5511988887777' })
  @IsOptional()
  @IsString()
  contactWhatsApp?: string;

  // --- Negociação ---

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  acceptsExchange?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  acceptsFinancing?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  acceptsCarTrade?: boolean;

  @ApiPropertyOptional({ description: 'Imóvel na planta / lançamento' })
  @IsOptional()
  @IsBoolean()
  isLaunch?: boolean;

  @ApiPropertyOptional({ description: 'Pronto para morar' })
  @IsOptional()
  @IsBoolean()
  isReadyToMove?: boolean;

  // --- SEO ---

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaDescription?: string;

  // --- Mídia ---

  @ApiPropertyOptional({
    description: 'URL de vídeo ou tour virtual',
  })
  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @ApiPropertyOptional({
    description: 'URL de tour virtual imersivo 360°',
  })
  @IsOptional()
  @IsUrl()
  virtualTourUrl?: string;

  // --- Integração com portais ---

  @ApiPropertyOptional({ description: 'Publicar no VivaReal' })
  @IsOptional()
  @IsBoolean()
  publishToVivaReal?: boolean;

  @ApiPropertyOptional({ description: 'Publicar no OLX' })
  @IsOptional()
  @IsBoolean()
  publishToOLX?: boolean;

  @ApiPropertyOptional({ description: 'Publicar no ZAP Imóveis' })
  @IsOptional()
  @IsBoolean()
  publishToZapImoveis?: boolean;

  // Tipo do imóvel — pode ser corrigido após a criação
  @ApiPropertyOptional({
    description: 'Tipo do imóvel',
    enum: [
      'APARTMENT',
      'HOUSE',
      'CONDO_HOUSE',
      'STUDIO',
      'LAND',
      'COMMERCIAL',
      'FARM',
      'OTHER',
    ],
  })
  @IsOptional()
  @IsEnum([
    'APARTMENT',
    'HOUSE',
    'CONDO_HOUSE',
    'STUDIO',
    'LAND',
    'COMMERCIAL',
    'FARM',
    'OTHER',
  ])
  type?: ListingEntity['type'];

  // Finalidade — pode ser corrigida após a criação
  @ApiPropertyOptional({
    description: 'Finalidade: RENT ou SALE',
    enum: ['RENT', 'SALE'],
  })
  @IsOptional()
  @IsEnum(['RENT', 'SALE'])
  purpose?: ListingEntity['purpose'];
}
