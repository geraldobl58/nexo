import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AdvertiserEntity } from '../../../domain/entities/advertiser.entity';
import { AdvertiserStatus } from '../../../domain/enums/advertiser-status.enum';
import { AdvertiserType } from '../../../domain/enums/advertiser-type.enum';

/**
 * DTO: RESPOSTA DE ANUNCIANTE
 *
 * Formata os dados de um AdvertiserEntity para a resposta da API.
 * Usa o padrão Factory (fromEntity) para desacoplar o domínio do HTTP.
 */
export class AdvertiserResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ enum: AdvertiserType, example: AdvertiserType.BROKER })
  type!: AdvertiserType;

  @ApiProperty({ enum: AdvertiserStatus, example: AdvertiserStatus.PENDING })
  status!: AdvertiserStatus;

  @ApiProperty({ example: 'João Silva' })
  name!: string;

  @ApiProperty({ example: 'joao@imob.com' })
  email!: string;

  @ApiProperty({ example: '11912345678' })
  phone!: string;

  @ApiPropertyOptional({ example: '11912345679' })
  whatsapp!: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.nexo.com/avatars/joao.jpg' })
  avatar!: string | null;

  @ApiPropertyOptional({ example: 'Imobiliária São Paulo Ltda.' })
  companyName!: string | null;

  @ApiPropertyOptional({ example: 'Imob SP' })
  tradeName!: string | null;

  @ApiPropertyOptional({ example: '12345F' })
  creci!: string | null;

  @ApiPropertyOptional({ example: 'SP' })
  creciState!: string | null;

  @ApiPropertyOptional({ example: 'São Paulo' })
  city!: string | null;

  @ApiPropertyOptional({ example: 'SP' })
  state!: string | null;

  @ApiProperty({ example: false })
  isVerified!: boolean;

  @ApiPropertyOptional()
  verifiedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  /**
   * Cria um AdvertiserResponseDto a partir de uma entidade de domínio.
   *
   * @param entity - Entidade retornada pelo use-case
   * @returns DTO pronto para serialização pela API
   */
  static fromEntity(entity: AdvertiserEntity): AdvertiserResponseDto {
    const dto = new AdvertiserResponseDto();

    dto.id = entity.id;
    dto.type = entity.type;
    dto.status = entity.status;
    dto.name = entity.name;
    dto.email = entity.email;
    dto.phone = entity.phone;
    dto.whatsapp = entity.whatsapp;
    dto.avatar = entity.avatar;
    dto.companyName = entity.companyName;
    dto.tradeName = entity.tradeName;
    dto.creci = entity.creci;
    dto.creciState = entity.creciState;
    dto.city = entity.city;
    dto.state = entity.state;
    dto.isVerified = entity.isVerified;
    dto.verifiedAt = entity.verifiedAt;
    dto.createdAt = entity.createdAt;

    return dto;
  }
}
