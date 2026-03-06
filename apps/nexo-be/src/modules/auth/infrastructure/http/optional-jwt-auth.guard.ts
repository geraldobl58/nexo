import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * GUARD JWT OPCIONAL
 *
 * Diferente do JwtAuthGuard padrão, NÃO lança 401 quando o token está ausente.
 * Se um token válido for enviado, popula `request.user` normalmente.
 * Se não houver token (ou for inválido), `request.user` fica `undefined`.
 *
 * Uso: rotas públicas que exibem comportamento diferente para usuários logados.
 * Exemplo: GET /marketing/:id — retorna DRAFT apenas para o dono.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('keycloak') {
  // Sobrescreve canActivate: tenta autenticar mas nunca bloqueia a requisição.
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Chama o guard original; se falhar (sem token), continua mesmo assim.
      await super.canActivate(context);
    } catch {
      // Sem token ou token inválido — apenas segue sem usuário.
    }
    return true;
  }

  // Sobrescreve handleRequest: nunca lança erro, apenas retorna null se falhar.
  override handleRequest<TUser>(err: unknown, user: TUser): TUser {
    return user ?? (null as TUser);
  }
}
