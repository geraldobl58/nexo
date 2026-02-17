import {
  INestApplication,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const adapter = new PrismaPg(pool);

    super({
      adapter,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
    } catch (error) {
      console.error('Prisma disconnect error:', error);
    }
  }

  enableShutdownHooks(app: INestApplication): void {
    try {
      // @ts-expect-error runtime event name
      this.$on('beforeExit', () => {
        void app.close();
      });
    } catch {
      process.on('beforeExit', () => {
        void app.close();
      });
    }
  }
}
