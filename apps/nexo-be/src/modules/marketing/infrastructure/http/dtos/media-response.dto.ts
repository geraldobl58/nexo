import { ApiProperty } from '@nestjs/swagger';
import { MediaEntity } from '../../../domain/entities/marketing-media.entity';

export class MediaResponseDto {
  @ApiProperty({
    description: 'UUID da mídia',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id: string;

  @ApiProperty({
    description: 'UUID do imóvel',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  propertyId: string;

  @ApiProperty({
    description: 'Tipo do arquivo',
    enum: ['IMAGE', 'VIDEO'],
    example: 'IMAGE',
  })
  type: string;

  @ApiProperty({
    description: 'URL pública CDN do Cloudinary',
    example:
      'https://res.cloudinary.com/dtykejdjn/image/upload/v1234567890/nexo/properties/uuid/photo.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Posição na galeria (0 = capa)',
    example: 0,
  })
  order: number;

  @ApiProperty({
    description: 'Data de criação',
    example: '2026-03-01T12:00:00.000Z',
  })
  createdAt: Date;

  static fromEntity(m: MediaEntity): MediaResponseDto {
    const dto = new MediaResponseDto();
    dto.id = m.id;
    dto.propertyId = m.propertyId;
    dto.type = m.type;
    dto.url = m.url;
    dto.order = m.order;
    dto.createdAt = m.createdAt;
    return dto;
  }
}
