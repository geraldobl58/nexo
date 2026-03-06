import { ApiProperty } from '@nestjs/swagger';

export class MeResponseDto {
  @ApiProperty({ example: 'c56a4180-65aa-42ec-a945-5fd21dec0538' })
  id: string;

  @ApiProperty({ example: '9f84b5a2-1c3d-4e6f-a8b7-2d9e0f1c3a5b' })
  keycloakId: string;

  @ApiProperty({ example: 'dev@nexo.local' })
  email: string;

  @ApiProperty({ example: 'Dev Nexo' })
  name: string;

  @ApiProperty({ example: 'SUPPORT', enum: ['ADMIN', 'MODERATOR', 'SUPPORT'] })
  role: string;

  @ApiProperty({ example: true })
  isActive: boolean;
}
