import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthUser } from '@/modules/auth/domain/entities/auth-user';
import { SyncUserUseCase } from '../../application/use-cases/sync-user.use-case';

@Injectable()
export class SyncUserInterceptor implements NestInterceptor {
  constructor(private readonly syncUser: SyncUserUseCase) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<{
      user?: AuthUser;
    }>();

    const authUser = request.user;

    // Skip: public route (no user set by Passport guard)
    if (!authUser?.keycloakId) {
      return next.handle();
    }

    // Sync user to DB and replace request.user with the DB record
    const dbUser = await this.syncUser.execute(authUser);
    request.user = dbUser as unknown as AuthUser;

    return next.handle();
  }
}
