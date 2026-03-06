import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/libs/prisma/prisma.service';
import {
  IdentityUserRepository,
  UpsertUserData,
} from '../../domain/repositories/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaIdentityUserRepository implements IdentityUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertUser(data: UpsertUserData): Promise<UserEntity> {
    return this.prisma.user.upsert({
      where: { keycloakId: data.keycloakId },
      update: {
        email: data.email,
        name: data.name,
        role: data.role,
        lastLoginAt: new Date(),
      },
      create: {
        keycloakId: data.keycloakId,
        email: data.email,
        name: data.name,
        role: data.role,
        isActive: true,
      },
      select: {
        id: true,
        keycloakId: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        timezone: true,
        language: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
