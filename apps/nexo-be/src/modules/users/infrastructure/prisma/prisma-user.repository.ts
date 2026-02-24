import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/libs/prisma/prisma.service';
import { UserEntity } from '@/modules/identity/domain/entities/user.entity';
import {
  IUserRepository,
  PaginatedResult,
  UpdateUserData,
  UserFilters,
} from '../../domain/repositories/user.repository';

/** Campos retornados em todas as queries (evita trazer dados desnecessários) */
const USER_SELECT = {
  id: true,
  keycloakId: true,
  email: true,
  name: true,
  role: true,
  phone: true,
  avatar: true,
  timezone: true,
  language: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * IMPLEMENTAÇÃO PRISMA DO REPOSITÓRIO DE USUÁRIOS
 *
 * Contém apenas operações de leitura e atualização.
 * A criação é feita pelo IdentityModule no momento do login.
 */
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
    return (user as UserEntity | null) ?? null;
  }

  async findMany(filters: UserFilters): Promise<PaginatedResult<UserEntity>> {
    const { role, isActive, search, page = 1, limit = 20 } = filters;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: data as UserEntity[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: UpdateUserData): Promise<UserEntity> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
        select: USER_SELECT,
      });
      return user as UserEntity;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Usuário com id "${id}" não encontrado.`);
      }
      throw error;
    }
  }
}
