import { UserDTO, UserRepository } from '@/domain/user/user.repository';
import { PrismaService } from '@/libs/prisma/prisma.service';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsertFromAuth(data: {
    keycloakId: string;
    email: string;
    name: string;
  }): Promise<UserDTO> {
    return this.prisma.user.upsert({
      where: { keycloakId: data.keycloakId },
      update: {
        email: data.email,
        name: data.name,
        lastLoginAt: new Date(),
      },
      create: {
        keycloakId: data.keycloakId,
        email: data.email,
        name: data.name,
        isActive: true,
      },
      select: {
        id: true,
        keycloakId: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
  }
}
