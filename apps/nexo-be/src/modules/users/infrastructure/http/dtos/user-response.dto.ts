import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  UserEntity,
  UserRole,
} from '@/modules/identity/domain/entities/user.entity';

/**
 * DTO: RESPOSTA DE USUÁRIO INTERNO
 */
export class UserResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'admin@nexo.com.br' })
  email!: string;

  @ApiProperty({ example: 'Admin Nexo' })
  name!: string;

  @ApiProperty({ enum: ['ADMIN', 'MODERATOR', 'SUPPORT'], example: 'ADMIN' })
  role!: UserRole;

  @ApiPropertyOptional({ example: '11999990001' })
  phone!: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.nexo.com/avatars/admin.jpg' })
  avatar!: string | null;

  @ApiProperty({ example: 'America/Sao_Paulo' })
  timezone!: string | null;

  @ApiProperty({ example: 'pt-BR' })
  language!: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiPropertyOptional()
  lastLoginAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  /**
   * Cria um UserResponseDto a partir de uma entidade de domínio.
   */
  static fromEntity(entity: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.email = entity.email;
    dto.name = entity.name;
    dto.role = entity.role;
    dto.phone = entity.phone;
    dto.avatar = entity.avatar;
    dto.timezone = entity.timezone;
    dto.language = entity.language;
    dto.isActive = entity.isActive;
    dto.lastLoginAt = entity.lastLoginAt;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
