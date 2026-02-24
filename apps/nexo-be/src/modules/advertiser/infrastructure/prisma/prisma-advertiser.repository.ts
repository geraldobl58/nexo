import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/libs/prisma/prisma.service';
import { AdvertiserEntity } from '../../domain/entities/advertiser.entity';
import {
  AdvertiserFilters,
  CreateAdvertiserData,
  IAdvertiserRepository,
  PaginatedResult,
  UpdateAdvertiserData,
} from '../../domain/repositories/advertiser.repository';

/**
 * IMPLEMENTAÇÃO PRISMA DO REPOSITÓRIO DE ANUNCIANTES
 *
 * Traduz as operações de domínio para queries Prisma.
 * Encapsula erros do Prisma e os converte em exceções do NestJS.
 *
 * Mapeamento de erros Prisma:
 *   P2002 (unique constraint) → ConflictException (409)
 *   P2025 (registro não encontrado no update) → NotFoundException (404)
 */
@Injectable()
export class PrismaAdvertiserRepository implements IAdvertiserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAdvertiserData): Promise<AdvertiserEntity> {
    try {
      const advertiser = await this.prisma.advertiser.create({ data });
      return advertiser as AdvertiserEntity;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const field = (error.meta?.target as string[])?.includes('email')
          ? 'E-mail'
          : 'Documento (CPF/CNPJ)';

        throw new ConflictException(`${field} já cadastrado.`);
      }

      throw error;
    }
  }

  async findById(id: string): Promise<AdvertiserEntity | null> {
    const advertiser = await this.prisma.advertiser.findUnique({
      where: { id },
    });
    return (advertiser as AdvertiserEntity | null) ?? null;
  }

  async findByEmail(email: string): Promise<AdvertiserEntity | null> {
    const advertiser = await this.prisma.advertiser.findUnique({
      where: { email },
    });
    return (advertiser as AdvertiserEntity | null) ?? null;
  }

  async update(
    id: string,
    data: UpdateAdvertiserData,
  ): Promise<AdvertiserEntity> {
    try {
      const advertiser = await this.prisma.advertiser.update({
        where: { id },
        data,
      });
      return advertiser as AdvertiserEntity;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Anunciante com id "${id}" não encontrado.`,
        );
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('E-mail ou documento já cadastrado.');
      }

      throw error;
    }
  }

  async findMany(
    filters: AdvertiserFilters,
  ): Promise<PaginatedResult<AdvertiserEntity>> {
    const {
      type,
      status,
      city,
      state,
      isVerified,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const where: Prisma.AdvertiserWhereInput = {
      deletedAt: null,
      ...(type && { type }),
      ...(status && { status }),
      ...(city && { city }),
      ...(state && { state }),
      ...(isVerified !== undefined && { isVerified }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
          { tradeName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.advertiser.findMany({ where, skip, take: limit }),
      this.prisma.advertiser.count({ where }),
    ]);

    return {
      data: data as AdvertiserEntity[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.prisma.advertiser.count({ where: { email } });
    return count > 0;
  }
}
