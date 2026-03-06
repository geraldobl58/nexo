import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MediaOrderItemDto {
  @ApiProperty({
    description: 'UUID da mídia',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Nova posição (0 = primeira / capa)',
    minimum: 0,
    example: 0,
  })
  @IsInt()
  @Min(0)
  order: number;
}

export class ReorderMediaDto {
  @ApiProperty({
    description:
      'Lista de pares { id, order } com a nova ordenação da galeria. ' +
      'Deve conter todas as mídias do imóvel para evitar gaps.',
    type: [MediaOrderItemDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MediaOrderItemDto)
  items: MediaOrderItemDto[];
}
