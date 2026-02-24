import { Module } from '@nestjs/common';

import { PrismaModule } from '@/libs/prisma/prisma.module';
import { GetUserUseCase } from './application/use-cases/get-user.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { UpdateUserRoleUseCase } from './application/use-cases/update-user-role.use-case';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { UsersController } from './infrastructure/http/users.controller';
import { PrismaUserRepository } from './infrastructure/prisma/prisma-user.repository';

/**
 * MÓDULO DE USUÁRIOS INTERNOS
 *
 * Gerencia a equipe interna do portal (admins, moderadores, suporte).
 * A criação de usuários é feita automaticamente pelo IdentityModule
 * no momento do primeiro login via Keycloak.
 *
 * Este módulo expõe os endpoints de consulta e atualização de roles.
 */
@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    GetUserUseCase,
    ListUsersUseCase,
    UpdateUserRoleUseCase,
  ],
})
export class UsersModule {}
