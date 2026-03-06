import { MediaEntity, MediaType } from '../entities/marketing-media.entity';

/** Token de injeção (interfaces não existem em runtime no JS) */
export const MEDIA_REPOSITORY = 'MEDIA_REPOSITORY';

/** Dados para persistir uma nova mídia após o upload no Cloudinary */
export interface CreateMediaData {
  propertyId: string;
  type: MediaType;
  url: string;
  publicId: string;
  order: number;
}

/** Par id ↔ nova posição para reordenação em lote */
export interface MediaOrderItem {
  id: string;
  order: number;
}

export interface MediaRepository {
  /** Cria um registro de mídia já enviada ao Cloudinary */
  create(data: CreateMediaData): Promise<MediaEntity>;

  /** Lista todas as mídias de um imóvel, ordenadas por `order` ASC */
  findByPropertyId(propertyId: string): Promise<MediaEntity[]>;

  /** Busca uma mídia pelo ID */
  findById(id: string): Promise<MediaEntity | null>;

  /** Remove o registro do banco (o asset do Cloudinary é deletado no use-case) */
  delete(id: string): Promise<void>;

  /**
   * Atualiza a posição de N mídias em uma única transação.
   * Garante consistência sem gaps ou colisões de order.
   */
  reorder(items: MediaOrderItem[]): Promise<void>;

  /** Conta quantas mídias de um tipo um imóvel possui */
  countByPropertyAndType(propertyId: string, type: MediaType): Promise<number>;
}
