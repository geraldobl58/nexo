import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { AuthUser } from '@/domain/auth/auth-user';

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'keycloak') {
  constructor(config: ConfigService) {
    const keycloakUrl = config.getOrThrow<string>('KEYCLOAK_URL');
    const realm = config.getOrThrow<string>('KEYCLOAK_REALM');
    const issuerUrl = `${keycloakUrl}/realms/${realm}`;

    // Internal URL for JWKS fetching (cluster-internal DNS).
    // Falls back to KEYCLOAK_URL when not set (e.g. production with public DNS).
    const internalUrl = config.get<string>(
      'KEYCLOAK_INTERNAL_URL',
      keycloakUrl,
    );
    const jwksRealmUrl = `${internalUrl}/realms/${realm}`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer: issuerUrl,
      algorithms: ['RS256'],
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: `${jwksRealmUrl}/protocol/openid-connect/certs`,
      }),
    });
  }

  validate(payload: Record<string, unknown>): AuthUser {
    return {
      keycloakId: payload.sub as string,
      email: payload.email as string | undefined,
      name: payload.name as string | undefined,
      roles: (payload.realm_access as { roles?: string[] })?.roles ?? [],
    };
  }
}
