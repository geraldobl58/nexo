import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO: SUSPENDER ANUNCIANTE
 *
 * Valida o corpo da requisição PATCH /advertisers/:id/suspend.
 */
export class SuspendAdvertiserDto {
  @ApiProperty({
    description: 'Motivo da suspensão (será registrado e visível internamente)',
    example: 'Anúncios com informações fraudulentas reportados por 3 usuários.',
  })
  @IsString()
  @IsNotEmpty({ message: 'O motivo da suspensão é obrigatório.' })
  reason!: string;
}
