import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { PropertySummaryEntity } from '../../../domain/repositories/user.repository';

// ---------------------------------------------------------------------------
// Query Params
// ---------------------------------------------------------------------------

export class ListMyPropertiesQueryDto {
  @ApiPropertyOptional({
    enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'SOLD', 'RENTED'],
    description: 'Filtrar por status do imóvel',
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'ACTIVE', 'INACTIVE', 'SOLD', 'RENTED'], {
    message: 'Status inválido.',
  })
  status?: string;

  @ApiPropertyOptional({
    enum: ['RENT', 'SALE'],
    description: 'Filtrar por finalidade',
  })
  @IsOptional()
  @IsEnum(['RENT', 'SALE'], { message: 'Finalidade inválida.' })
  purpose?: string;

  @ApiPropertyOptional({ description: 'Busca por título, cidade ou bairro' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// ---------------------------------------------------------------------------
// Response DTOs
// ---------------------------------------------------------------------------

class AdvertiserSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class PropertySummaryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'SOLD', 'RENTED'] })
  status: string;

  @ApiProperty({ enum: ['RENT', 'SALE'] })
  purpose: string;

  @ApiProperty({
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
  type: string;

  @ApiProperty({ description: 'Preço em centavos' })
  price: number;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  district: string;

  @ApiPropertyOptional()
  areaM2: number | null;

  @ApiPropertyOptional()
  bedrooms: number | null;

  @ApiPropertyOptional()
  bathrooms: number | null;

  @ApiProperty()
  isFeatured: boolean;

  @ApiPropertyOptional()
  publishedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: AdvertiserSummaryDto })
  advertiser: AdvertiserSummaryDto;

  static fromEntity(entity: PropertySummaryEntity): PropertySummaryResponseDto {
    const dto = new PropertySummaryResponseDto();
    dto.id = entity.id;
    dto.title = entity.title;
    dto.slug = entity.slug;
    dto.status = entity.status;
    dto.purpose = entity.purpose;
    dto.type = entity.type;
    dto.price = entity.price;
    dto.city = entity.city;
    dto.state = entity.state;
    dto.district = entity.district;
    dto.areaM2 = entity.areaM2;
    dto.bedrooms = entity.bedrooms;
    dto.bathrooms = entity.bathrooms;
    dto.isFeatured = entity.isFeatured;
    dto.publishedAt = entity.publishedAt;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}

export class PaginatedMyPropertiesResponseDto {
  @ApiProperty({ type: [PropertySummaryResponseDto] })
  data: PropertySummaryResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
