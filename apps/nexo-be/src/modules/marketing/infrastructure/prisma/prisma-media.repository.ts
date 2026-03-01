import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/libs/prisma/prisma.service';
import { MediaType as PrismaMediaType } from '@prisma/client';
import {
  CreateMediaData,
  MediaOrderItem,
  MediaRepository,
} from '../../domain/repositories/marketing-media.repository';
import {
  MediaEntity,
  MediaType,
} from '../../domain/entities/marketing-media.entity';

/**
 * IMPLEMENTAÇÃO PRISMA DO REPOSITÓRIO DE MÍDIA
 *
 * Único lugar do módulo que conhece o model `PropertyMedia` do Prisma.
 */
@Injectable()
export class PrismaMediaRepository implements MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // Helpers privados
  // ---------------------------------------------------------------------------

  private toEntity(m: {
    id: string;
    propertyId: string;
    type: PrismaMediaType;
    url: string;
    publicId: string;
    order: number;
    createdAt: Date;
  }): MediaEntity {
    return {
      id: m.id,
      propertyId: m.propertyId,
      type: m.type as MediaType,
      url: m.url,
      publicId: m.publicId,
      order: m.order,
      createdAt: m.createdAt,
    };
  }

  // ---------------------------------------------------------------------------
  // Interface implementation
  // ---------------------------------------------------------------------------

  async create(data: CreateMediaData): Promise<MediaEntity> {
    const media = await this.prisma.propertyMedia.create({
      data: {
        propertyId: data.propertyId,
        type: data.type as PrismaMediaType,
        url: data.url,
        publicId: data.publicId,
        order: data.order,
      },
    });
    return this.toEntity(media);
  }

  async findByPropertyId(propertyId: string): Promise<MediaEntity[]> {
    const records = await this.prisma.propertyMedia.findMany({
      where: { propertyId },
      orderBy: { order: 'asc' },
    });
    return records.map((m) => this.toEntity(m));
  }

  async findById(id: string): Promise<MediaEntity | null> {
    const media = await this.prisma.propertyMedia.findUnique({ where: { id } });
    return media ? this.toEntity(media) : null;
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.propertyMedia.delete({ where: { id } });
    } catch {
      throw new NotFoundException(`Mídia com id "${id}" não encontrada.`);
    }
  }

  async reorder(items: MediaOrderItem[]): Promise<void> {
    // Executa todas as atualizações numa única transação para garantir atomicidade
    await this.prisma.$transaction(
      items.map(({ id, order }) =>
        this.prisma.propertyMedia.update({
          where: { id },
          data: { order },
        }),
      ),
    );
  }

  async countByPropertyAndType(
    propertyId: string,
    type: MediaType,
  ): Promise<number> {
    return this.prisma.propertyMedia.count({
      where: {
        propertyId,
        type: type as PrismaMediaType,
      },
    });
  }
}
