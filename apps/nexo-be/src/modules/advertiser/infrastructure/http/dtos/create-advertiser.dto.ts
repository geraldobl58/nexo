import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

import { AdvertiserType } from '../../../domain/enums/advertiser-type.enum';

/**
 * DTO: CRIAR ANUNCIANTE
 *
 * Valida o corpo da requisição POST /advertisers.
 */
export class CreateAdvertiserDto {
  @ApiProperty({
    description: 'Tipo do anunciante',
    enum: AdvertiserType,
    example: AdvertiserType.BROKER,
  })
  @IsEnum(AdvertiserType, {
    message: `Tipo inválido. Use: ${Object.values(AdvertiserType).join(', ')}`,
  })
  type!: AdvertiserType;

  @ApiProperty({
    description: 'Nome completo ou razão social',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  name!: string;

  @ApiProperty({
    description: 'E-mail principal (único)',
    example: 'joao@imob.com',
  })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email!: string;

  @ApiProperty({ description: 'Telefone principal', example: '11912345678' })
  @IsString()
  @IsNotEmpty({ message: 'O telefone é obrigatório.' })
  phone!: string;

  @ApiPropertyOptional({
    description: 'WhatsApp (se diferente do telefone)',
    example: '11912345679',
  })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiPropertyOptional({
    description: 'CNPJ ou CPF',
    example: '12.345.678/0001-90',
  })
  @IsOptional()
  @IsString()
  document?: string;

  @ApiPropertyOptional({ description: 'Número CRECI', example: '12345F' })
  @IsOptional()
  @IsString()
  creci?: string;

  @ApiPropertyOptional({ description: 'Estado do CRECI', example: 'SP' })
  @IsOptional()
  @IsString()
  @Length(2, 2, {
    message: 'O estado do CRECI deve ter 2 caracteres (ex: SP).',
  })
  creciState?: string;

  @ApiPropertyOptional({ description: 'Razão social da empresa' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ description: 'Nome fantasia' })
  @IsOptional()
  @IsString()
  tradeName?: string;

  @ApiPropertyOptional({ description: 'Logradouro' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ description: 'Número' })
  @IsOptional()
  @IsString()
  streetNumber?: string;

  @ApiPropertyOptional({ description: 'Complemento' })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiPropertyOptional({ description: 'Bairro' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: 'Cidade' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Estado (UF)', example: 'SP' })
  @IsOptional()
  @IsString()
  @Length(2, 2, { message: 'O estado deve ter 2 caracteres (ex: SP).' })
  state?: string;

  @ApiPropertyOptional({ description: 'CEP', example: '01310-100' })
  @IsOptional()
  @IsString()
  zipcode?: string;
}
