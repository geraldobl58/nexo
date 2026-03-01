import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@/libs/prisma/prisma.service';
import {
  CreateListingData,
  ListingFilters,
  ListingRepository,
  PaginatedResult,
  UpdateListingData,
} from '../../domain/repositories/marketing.repository';
import { ListingEntity } from '../../domain/entities/marketing.entity';
import { ListingStatus } from '../../domain/enums/marketing-status.enum';
import { ListingPlan } from '../../domain/enums/marketing-plan.enum';
import {
  MediaEntity,
  MediaType,
} from '../../domain/entities/marketing-media.entity';

/**
 * IMPLEMENTAÇÃO PRISMA DO REPOSITÓRIO DE ANÚnCIOS
 *
 * Aqui está o Único lugar do módulo que CONHECE o Prisma.
 * Todo o resto (use-cases, domínio) usa apenas a interface ListingRepository.
 *
 * Por que isso importa?
 * Se um dia quisermos trocar o banco de PostgreSQL para MongoDB,
 * só mudamos ESTE arquivo. Todo o resto continua igual.
 */
@Injectable()
export class PrismaListingRepository implements ListingRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // Helpers privados
  // ---------------------------------------------------------------------------

  /**
   * Converte o status do domínio (ListingStatus) para o enum do Prisma (PropertyStatus).
   *
   * Por que converter?
   * Nossa camada de domínio usa seu próprio enum para não depender do Prisma.
   * Mas o Prisma só entende o tipo dele. Este método faz a ponte.
   */
  private toPrismaStatus(status: ListingStatus): PropertyStatus {
    return status as unknown as PropertyStatus;
  }

  /**
   * Converte um registro do Prisma (Property) para nossa entidade de domínio (ListingEntity).
   *
   * O Prisma retorna tipos com `Decimal` (para latitude/longitude) e
   * enums do tipo `PropertyStatus`. Este método normaliza tudo para
   * os tipos que o domínio espera.
   *
   * Regra geral: NUNCA deixe tipos do Prisma vazarem para fora da camada de infraestrutura.
   */
  private toEntity(
    p: Prisma.PropertyGetPayload<object> & {
      media?: Array<{
        id: string;
        propertyId: string;
        type: string;
        url: string;
        publicId: string;
        order: number;
        createdAt: Date;
      }>;
    },
  ): ListingEntity {
    return {
      id: p.id,
      externalId: p.externalId,
      createdById: p.createdById,
      status: p.status as unknown as ListingStatus,
      purpose: p.purpose as ListingEntity['purpose'],
      type: p.type as ListingEntity['type'],
      title: p.title,
      description: p.description,
      price: p.price,
      condominiumFee: p.condominiumFee,
      iptuYearly: p.iptuYearly,
      areaM2: p.areaM2,
      builtArea: p.builtArea,
      bedrooms: p.bedrooms,
      suites: p.suites,
      bathrooms: p.bathrooms,
      garageSpots: p.garageSpots,
      floor: p.floor,
      totalFloors: p.totalFloors,
      furnished: p.furnished,
      petFriendly: p.petFriendly,
      yearBuilt: p.yearBuilt,
      city: p.city,
      state: p.state,
      district: p.district,
      street: p.street,
      streetNumber: p.streetNumber,
      complement: p.complement,
      zipcode: p.zipcode,
      // Decimal do Prisma → number do TypeScript
      latitude: p.latitude ? Number(p.latitude) : null,
      longitude: p.longitude ? Number(p.longitude) : null,
      // Contato específico do anúncio
      contactName: p.contactName,
      contactEmail: p.contactEmail,
      contactPhone: p.contactPhone,
      contactWhatsApp: p.contactWhatsApp,
      acceptsExchange: p.acceptsExchange,
      acceptsFinancing: p.acceptsFinancing,
      acceptsCarTrade: p.acceptsCarTrade,
      isLaunch: p.isLaunch,
      isReadyToMove: p.isReadyToMove,
      slug: p.slug,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      videoUrl: p.videoUrl,
      virtualTourUrl: p.virtualTourUrl,
      // Analytics (read-only — incrementados por eventos)
      viewsCount: p.viewsCount,
      uniqueViewsCount: p.uniqueViewsCount,
      leadsCount: p.leadsCount,
      favoritesCount: p.favoritesCount,
      sharesCount: p.sharesCount,
      phoneClicksCount: p.phoneClicksCount,
      whatsappClicksCount: p.whatsappClicksCount,
      emailClicksCount: p.emailClicksCount,
      // Origem dos leads
      leadSourcePortal: p.leadSourcePortal,
      leadSourceSearch: p.leadSourceSearch,
      leadSourceMap: p.leadSourceMap,
      leadSourceFeatured: p.leadSourceFeatured,
      // Plano e destaque
      listingPlan: p.listingPlan as unknown as ListingPlan,
      isFeatured: p.isFeatured,
      highlightUntil: p.highlightUntil,
      // Avaliação
      averageRating: p.averageRating,
      totalReviews: p.totalReviews,
      // Integração com portais
      publishToVivaReal: p.publishToVivaReal,
      publishToOLX: p.publishToOLX,
      publishToZapImoveis: p.publishToZapImoveis,
      publishedAt: p.publishedAt,
      expiresAt: p.expiresAt,
      deletedAt: p.deletedAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      media: p.media?.map(
        (m): MediaEntity => ({
          id: m.id,
          propertyId: m.propertyId,
          type: m.type as MediaType,
          url: m.url,
          publicId: m.publicId,
          order: m.order,
          createdAt: m.createdAt,
        }),
      ),
    };
  }

  // ---------------------------------------------------------------------------
  // Implementação da interface
  // ---------------------------------------------------------------------------

  async create(data: CreateListingData): Promise<ListingEntity> {
    try {
      const record = await this.prisma.property.create({
        data: {
          externalId: data.externalId,
          createdById: data.createdById,
          purpose: data.purpose,
          type: data.type,
          title: data.title,
          description: data.description,
          price: data.price,
          condominiumFee: data.condominiumFee,
          iptuYearly: data.iptuYearly,
          areaM2: data.areaM2,
          builtArea: data.builtArea,
          bedrooms: data.bedrooms,
          suites: data.suites,
          bathrooms: data.bathrooms,
          garageSpots: data.garageSpots,
          floor: data.floor,
          totalFloors: data.totalFloors,
          furnished: data.furnished,
          petFriendly: data.petFriendly,
          yearBuilt: data.yearBuilt,
          city: data.city,
          state: data.state,
          district: data.district,
          street: data.street,
          streetNumber: data.streetNumber,
          complement: data.complement,
          zipcode: data.zipcode,
          latitude: data.latitude,
          longitude: data.longitude,
          // Contato específico
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          contactWhatsApp: data.contactWhatsApp,
          acceptsExchange: data.acceptsExchange ?? false,
          acceptsFinancing: data.acceptsFinancing ?? true,
          acceptsCarTrade: data.acceptsCarTrade ?? false,
          isLaunch: data.isLaunch ?? false,
          isReadyToMove: data.isReadyToMove ?? false,
          slug: data.slug,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          // Mídia
          videoUrl: data.videoUrl,
          virtualTourUrl: data.virtualTourUrl,
          // Plano e integração
          listingPlan: data.listingPlan,
          isFeatured: data.isFeatured ?? false,
          highlightUntil: data.highlightUntil,
          publishToVivaReal: data.publishToVivaReal ?? false,
          publishToOLX: data.publishToOLX ?? false,
          publishToZapImoveis: data.publishToZapImoveis ?? false,
          // status DRAFT é o padrão definido no schema Prisma
        },
      });

      return this.toEntity(record);
    } catch (err) {
      /**
       * P2003: Foreign key constraint failed.
       * Acontece quando o advertiserId enviado não existe na tabela Advertiser.
       * Convertemos para 404 com mensagem clara em vez de explodir como 500.
       */
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new NotFoundException(
          `Usuário com id "${data.createdById}" não encontrado.`,
        );
      }
      throw err;
    }
  }

  async findById(id: string): Promise<ListingEntity | null> {
    const record = await this.prisma.property.findUnique({
      where: { id },
      include: {
        media: { orderBy: { order: 'asc' } },
      },
    });

    return record ? this.toEntity(record) : null;
  }

  async update(id: string, data: UpdateListingData): Promise<ListingEntity> {
    const record = await this.prisma.property.update({
      where: { id },
      data: {
        ...(data.status && { status: this.toPrismaStatus(data.status) }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.condominiumFee !== undefined && {
          condominiumFee: data.condominiumFee,
        }),
        ...(data.iptuYearly !== undefined && { iptuYearly: data.iptuYearly }),
        ...(data.areaM2 !== undefined && { areaM2: data.areaM2 }),
        ...(data.builtArea !== undefined && { builtArea: data.builtArea }),
        ...(data.bedrooms !== undefined && { bedrooms: data.bedrooms }),
        ...(data.suites !== undefined && { suites: data.suites }),
        ...(data.bathrooms !== undefined && { bathrooms: data.bathrooms }),
        ...(data.garageSpots !== undefined && {
          garageSpots: data.garageSpots,
        }),
        ...(data.floor !== undefined && { floor: data.floor }),
        ...(data.totalFloors !== undefined && {
          totalFloors: data.totalFloors,
        }),
        ...(data.furnished !== undefined && { furnished: data.furnished }),
        ...(data.petFriendly !== undefined && {
          petFriendly: data.petFriendly,
        }),
        ...(data.yearBuilt !== undefined && { yearBuilt: data.yearBuilt }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.district !== undefined && { district: data.district }),
        ...(data.street !== undefined && { street: data.street }),
        ...(data.streetNumber !== undefined && {
          streetNumber: data.streetNumber,
        }),
        ...(data.complement !== undefined && { complement: data.complement }),
        ...(data.zipcode !== undefined && { zipcode: data.zipcode }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        // Contato
        ...(data.contactName !== undefined && {
          contactName: data.contactName,
        }),
        ...(data.contactEmail !== undefined && {
          contactEmail: data.contactEmail,
        }),
        ...(data.contactPhone !== undefined && {
          contactPhone: data.contactPhone,
        }),
        ...(data.contactWhatsApp !== undefined && {
          contactWhatsApp: data.contactWhatsApp,
        }),
        // Negociação
        ...(data.acceptsExchange !== undefined && {
          acceptsExchange: data.acceptsExchange,
        }),
        ...(data.acceptsFinancing !== undefined && {
          acceptsFinancing: data.acceptsFinancing,
        }),
        ...(data.acceptsCarTrade !== undefined && {
          acceptsCarTrade: data.acceptsCarTrade,
        }),
        ...(data.isLaunch !== undefined && { isLaunch: data.isLaunch }),
        ...(data.isReadyToMove !== undefined && {
          isReadyToMove: data.isReadyToMove,
        }),
        // SEO
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
        ...(data.metaDescription !== undefined && {
          metaDescription: data.metaDescription,
        }),
        // Mídia
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
        ...(data.virtualTourUrl !== undefined && {
          virtualTourUrl: data.virtualTourUrl,
        }),
        // Plano e destaque
        ...(data.listingPlan !== undefined && {
          listingPlan: data.listingPlan,
        }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.highlightUntil !== undefined && {
          highlightUntil: data.highlightUntil,
        }),
        // Integração
        ...(data.publishToVivaReal !== undefined && {
          publishToVivaReal: data.publishToVivaReal,
        }),
        ...(data.publishToOLX !== undefined && {
          publishToOLX: data.publishToOLX,
        }),
        ...(data.publishToZapImoveis !== undefined && {
          publishToZapImoveis: data.publishToZapImoveis,
        }),
        // Controle
        ...(data.purpose !== undefined && { purpose: data.purpose }),
        ...(data.type !== undefined && { type: data.type }),
        // Controle
        ...(data.publishedAt && { publishedAt: data.publishedAt }),
        ...(data.expiresAt !== undefined && { expiresAt: data.expiresAt }),
      },
    });

    return this.toEntity(record);
  }

  async findMany(
    filters: ListingFilters,
  ): Promise<PaginatedResult<ListingEntity>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit; // quantos registros pular

    /**
     * Monta o objeto `where` do Prisma apenas com os filtros fornecidos.
     * Usamos `??` e checagem explícita para não enviar `undefined` ao Prisma.
     */
    const where: Prisma.PropertyWhereInput = {
      // Por padrão só retorna anúncios ativos
      status: PropertyStatus.ACTIVE,

      // Soft delete: ignora anúncios excluídos
      deletedAt: null,

      ...(filters.purpose && { purpose: filters.purpose }),
      ...(filters.type && { type: filters.type }),
      ...(filters.createdById && { createdById: filters.createdById }),

      // Filtro de cidade (case-insensitive via `mode: 'insensitive'`)
      // Localização
      ...(filters.city && {
        city: { contains: filters.city, mode: 'insensitive' },
      }),
      ...(filters.state && {
        state: { equals: filters.state.toUpperCase() },
      }),
      ...(filters.district && {
        district: { contains: filters.district, mode: 'insensitive' },
      }),

      // Preço (gte = greater than or equal, lte = less than or equal)
      ...((filters.minPrice !== undefined ||
        filters.maxPrice !== undefined) && {
        price: {
          ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
          ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
        },
      }),

      // Quartos
      ...((filters.minBedrooms !== undefined ||
        filters.maxBedrooms !== undefined) && {
        bedrooms: {
          ...(filters.minBedrooms !== undefined && {
            gte: filters.minBedrooms,
          }),
          ...(filters.maxBedrooms !== undefined && {
            lte: filters.maxBedrooms,
          }),
        },
      }),

      // Banheiros
      ...(filters.minBathrooms !== undefined && {
        bathrooms: { gte: filters.minBathrooms },
      }),

      // Vagas de garagem
      ...(filters.minGarageSpots !== undefined && {
        garageSpots: { gte: filters.minGarageSpots },
      }),

      // Área total
      ...((filters.minAreaM2 !== undefined ||
        filters.maxAreaM2 !== undefined) && {
        areaM2: {
          ...(filters.minAreaM2 !== undefined && { gte: filters.minAreaM2 }),
          ...(filters.maxAreaM2 !== undefined && { lte: filters.maxAreaM2 }),
        },
      }),

      // Características booleanas (só aplica o filtro quando explicitamente fornecido)
      ...(filters.furnished !== undefined && { furnished: filters.furnished }),
      ...(filters.petFriendly !== undefined && {
        petFriendly: filters.petFriendly,
      }),
      ...(filters.acceptsFinancing !== undefined && {
        acceptsFinancing: filters.acceptsFinancing,
      }),
      ...(filters.acceptsExchange !== undefined && {
        acceptsExchange: filters.acceptsExchange,
      }),
      ...(filters.isLaunch !== undefined && { isLaunch: filters.isLaunch }),
      ...(filters.isReadyToMove !== undefined && {
        isReadyToMove: filters.isReadyToMove,
      }),
      ...(filters.isFeatured !== undefined && {
        isFeatured: filters.isFeatured,
      }),
    };

    // Executa as duas queries em paralelo com Promise.all para performance
    const [records, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        // Mais recentes primeiro
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      items: records.map((r) => this.toEntity(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async slugExists(slug: string): Promise<boolean> {
    const count = await this.prisma.property.count({ where: { slug } });
    return count > 0;
  }

  async softDelete(id: string): Promise<void> {
    try {
      await this.prisma.property.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException(`Anúncio com id "${id}" não encontrado.`);
      }
      throw err;
    }
  }
}
