import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { AdvertiserStatus } from '../../../domain/enums/advertiser-status.enum';
import { AdvertiserType } from '../../../domain/enums/advertiser-type.enum';

/**
 * DTO: QUERY PARAMS PARA LISTAGEM DE ANUNCIANTES
 *
 * GET /advertisers?type=BROKER&city=São Paulo&page=1&limit=20
 */
export class GetAdvertisersQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar por tipo de anunciante',
    enum: AdvertiserType,
  })
  @IsOptional()
  @IsEnum(AdvertiserType)
  type?: AdvertiserType;

  @ApiPropertyOptional({
    description: 'Filtrar por status',
    enum: AdvertiserStatus,
  })
  @IsOptional()
  @IsEnum(AdvertiserStatus)
  status?: AdvertiserStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por cidade',
    example: 'São Paulo',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado (UF)',
    example: 'SP',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: 'Apenas anunciantes verificados',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Busca por nome, empresa ou e-mail',
    example: 'imobiliaria',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Número da página (começa em 1)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Itens por página (máx. 100)',
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
