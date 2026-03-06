import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { ListingEntity } from '../../../domain/entities/marketing.entity';
import { ListingPlan } from '../../../domain/enums/marketing-plan.enum';

/**
 * DTO DE CRIAÇÃO DE ANÚNCIO
 *
 * O que é um DTO (Data Transfer Object)?
 * É um objeto que define a "forma" dos dados que chegam na requisição HTTP.
 *
 * Por que usar DTOs?
 * 1. Validação automática: o NestJS + class-validator verifica os campos
 *    antes de chegar no controller. Se inválido, retorna 400 automaticamente.
 * 2. Documentação: os decorators @ApiProperty geram a documentação Swagger.
 * 3. Segurança: com `whitelist: true` no ValidationPipe (configurado em main.ts),
 *    qualquer campo extra que o usuário envie é automaticamente removido.
 *
 * Fluxo: Request HTTP → DTO (validação) → Controller → Use Case
 */
export class CreateListingDto {
  // --- Classificação ---

  @ApiProperty({
    description: 'Finalidade do imóvel',
    enum: ['RENT', 'SALE'],
    example: 'SALE',
  })
  @IsEnum(['RENT', 'SALE'])
  purpose: 'RENT' | 'SALE';

  @ApiProperty({
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
    example: 'APARTMENT',
  })
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
  type: ListingEntity['type'];

  // --- Conteúdo ---

  @ApiProperty({
    description: 'Título do anúncio (entre 10 e 150 caracteres)',
    example: 'Apartamento 3 quartos com vista para o mar no Guarujá',
    minLength: 10,
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada do imóvel',
    example:
      'Lindo apartamento com varanda gourmet, piscina e churrasqueira...',
  })
  @IsOptional()
  @IsString()
  description?: string;

  // --- Valores ---

  @ApiProperty({
    description: 'Preço em centavos. R$ 350.000 = 35000000',
    example: 35000000,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  price: number;

  @ApiPropertyOptional({
    description: 'Taxa de condomínio mensal em centavos',
    example: 80000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  condominiumFee?: number;

  @ApiPropertyOptional({
    description: 'IPTU anual em centavos',
    example: 360000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  iptuYearly?: number;

  // --- Localização ---

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'Sigla do estado',
    example: 'SP',
    minLength: 2,
    maxLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: 'Pinheiros' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiPropertyOptional({ example: 'Rua dos Pinheiros' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ example: '100' })
  @IsOptional()
  @IsString()
  streetNumber?: string;

  @ApiPropertyOptional({ example: 'Apto 42' })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiPropertyOptional({ example: '05422-010' })
  @IsOptional()
  @IsString()
  zipcode?: string;

  @ApiPropertyOptional({ example: -23.5617 })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: -46.6559 })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  // --- Características físicas ---

  @ApiPropertyOptional({ description: 'Área total em m²', example: 85 })
  @IsOptional()
  @IsInt()
  @Min(1)
  areaM2?: number;

  @ApiPropertyOptional({ description: 'Área construída em m²', example: 75 })
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

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  garageSpots?: number;

  @ApiPropertyOptional({ description: 'Número do andar', example: 12 })
  @IsOptional()
  @IsInt()
  @Min(0)
  floor?: number;

  @ApiPropertyOptional({
    description: 'Total de andares do edifício',
    example: 20,
  })
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

  @ApiPropertyOptional({ example: 2018 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 5)
  yearBuilt?: number;

  // --- Negociação ---

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  acceptsExchange?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  acceptsFinancing?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  acceptsCarTrade?: boolean;

  @ApiPropertyOptional({
    description: 'Imóvel na planta / lançamento',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isLaunch?: boolean;

  @ApiPropertyOptional({ description: 'Pronto para morar', default: false })
  @IsOptional()
  @IsBoolean()
  isReadyToMove?: boolean;

  // --- SEO ---

  @ApiPropertyOptional({
    description: 'Título SEO (para a tag <title> da página do imóvel)',
  })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({
    description: 'Descrição SEO (para a meta description)',
  })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  // --- Identificação externa ---

  @ApiPropertyOptional({
    description: 'ID de integração com portal externo (VivaReal, OLX, ZAP…)',
    example: 'vr-12345678',
  })
  @IsOptional()
  @IsString()
  externalId?: string;

  // --- Contato específico do anúncio ---

  @ApiPropertyOptional({
    description: 'Nome do contato responsável pelo anúncio',
    example: 'João da Silva',
  })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({
    description: 'E-mail do contato do anúncio',
    example: 'joao@imobiliaria.com.br',
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({
    description: 'Telefone do contato do anúncio',
    example: '+5511999999999',
  })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({
    description: 'WhatsApp do contato do anúncio',
    example: '+5511999999999',
  })
  @IsOptional()
  @IsString()
  contactWhatsApp?: string;

  // --- Mídia ---

  @ApiPropertyOptional({
    description: 'URL de vídeo ou tour virtual (YouTube, etc.)',
    example: 'https://www.youtube.com/watch?v=abc123',
  })
  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @ApiPropertyOptional({
    description: 'URL de tour virtual imersivo 360° (Matterport, etc.)',
    example: 'https://my.matterport.com/show/?m=abc123',
  })
  @IsOptional()
  @IsUrl()
  virtualTourUrl?: string;

  // --- Plano ---

  @ApiPropertyOptional({
    description: 'Plano do anúncio',
    enum: ListingPlan,
    default: ListingPlan.FREE,
    example: ListingPlan.STANDARD,
  })
  @IsOptional()
  @IsEnum(ListingPlan)
  listingPlan?: ListingPlan;

  // --- Integração com portais ---

  @ApiPropertyOptional({
    description: 'Publicar automaticamente no VivaReal',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  publishToVivaReal?: boolean;

  @ApiPropertyOptional({
    description: 'Publicar automaticamente no OLX',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  publishToOLX?: boolean;

  @ApiPropertyOptional({
    description: 'Publicar automaticamente no ZAP Imóveis',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  publishToZapImoveis?: boolean;
}
