import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsString, Max, Min } from 'class-validator';

import { UserRole } from '@/modules/identity/domain/entities/user.entity';
import { UserResponseDto } from './user-response.dto';

/** DTO: Atualizar role do usuário */
export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'Novo papel do usuário',
    enum: ['ADMIN', 'MODERATOR', 'SUPPORT'],
    example: 'MODERATOR',
  })
  @IsEnum(['ADMIN', 'MODERATOR', 'SUPPORT'], {
    message: 'Role inválida. Use: ADMIN, MODERATOR ou SUPPORT.',
  })
  role!: UserRole;
}

/** DTO: Query params para listagem de usuários */
export class ListUsersQueryDto {
  @ApiPropertyOptional({ enum: ['ADMIN', 'MODERATOR', 'SUPPORT'] })
  @IsOptional()
  @IsEnum(['ADMIN', 'MODERATOR', 'SUPPORT'])
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Filtrar por usuários ativos/inativos',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Busca por nome ou e-mail' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

/** DTO: Resposta paginada de usuários */
export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  data!: UserResponseDto[];

  @ApiProperty({ example: 10 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 1 })
  totalPages!: number;
}
