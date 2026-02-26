import { ConflictException, Inject, Injectable } from '@nestjs/common';

import { AuthUser } from '@/modules/auth/domain/entities/auth-user';
import { AdvertiserEntity } from '../../domain/entities/advertiser.entity';
import { AdvertiserType } from '../../domain/enums/advertiser-type.enum';
import {
  ADVERTISER_REPOSITORY,
  IAdvertiserRepository,
} from '../../domain/repositories/advertiser.repository';

/**
 * CASO DE USO: BUSCAR (OU CRIAR) MEU ANUNCIANTE
 *
 * Retorna o registro de Advertiser vinculado ao usuário autenticado.
 * Se não encontrado, cria automaticamente um registro OWNER com os dados do JWT.
 *
 * ESTRATÉGIA:
 *   1. Busca por keycloakId (vínculo direto com o token JWT)
 *   2. Fallback por e-mail → se encontrado sem keycloakId, vincula e retorna
 *   3. Nenhum encontrado → cria automaticamente um anunciante OWNER
 */
@Injectable()
export class GetMyAdvertiserUseCase {
  constructor(
    @Inject(ADVERTISER_REPOSITORY)
    private readonly advertiserRepository: IAdvertiserRepository,
  ) {}

  async execute(auth: AuthUser): Promise<AdvertiserEntity> {
    // 1. Tenta pelo keycloakId
    const byKeycloakId = await this.advertiserRepository.findByKeycloakId(
      auth.keycloakId,
    );
    if (byKeycloakId) return byKeycloakId;

    // 2. Fallback: tenta pelo e-mail
    if (auth.email) {
      const byEmail = await this.advertiserRepository.findByEmail(auth.email);
      if (byEmail) {
        // Vincula o keycloakId ao anunciante existente, se ainda não vinculado
        if (!byEmail.keycloakId) {
          return this.advertiserRepository.update(byEmail.id, {
            keycloakId: auth.keycloakId,
          });
        }
        return byEmail;
      }
    }

    // 3. Cria automaticamente um anunciante OWNER para o usuário
    const name =
      auth.name?.trim() ||
      (auth.email
        ? auth.email.split('@')[0]
        : `user-${auth.keycloakId.substring(0, 8)}`);

    const email = auth.email ?? `${auth.keycloakId}@auto.nexo`;

    try {
      return await this.advertiserRepository.create({
        type: AdvertiserType.OWNER,
        name,
        email,
        phone: '',
        keycloakId: auth.keycloakId,
      });
    } catch (error) {
      // Race condition: registro criado por outra requisição simultânea
      if (error instanceof ConflictException) {
        const existing = await this.advertiserRepository.findByEmail(email);
        if (existing) return existing;
      }
      throw error;
    }
  }
}
