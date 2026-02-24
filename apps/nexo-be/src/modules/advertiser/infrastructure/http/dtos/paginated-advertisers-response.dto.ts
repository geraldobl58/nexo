import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AdvertiserResponseDto } from './advertiser-response.dto';

/**
 * DTO: RESPOSTA PAGINADA DE ANUNCIANTES
 *
 * Envolve a lista de anunciantes com metadados de paginação.
 */
export class PaginatedAdvertisersResponseDto {
  @ApiProperty({ type: [AdvertiserResponseDto] })
  data!: AdvertiserResponseDto[];

  @ApiProperty({ example: 42, description: 'Total de registros encontrados' })
  total!: number;

  @ApiProperty({ example: 1, description: 'Página atual' })
  page!: number;

  @ApiProperty({ example: 20, description: 'Itens por página' })
  limit!: number;

  @ApiProperty({ example: 3, description: 'Total de páginas' })
  totalPages!: number;
}
