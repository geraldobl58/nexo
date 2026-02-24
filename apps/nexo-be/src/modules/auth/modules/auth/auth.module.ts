import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { KeycloakStrategy } from '@/modules/auth/infrastructure/auth/keycloak.strategy';
import { AuthController } from '@/modules/auth/infrastructure/http/auth.controller';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'keycloak' })],
  controllers: [AuthController],
  providers: [KeycloakStrategy],
})
export class AuthModule {}
