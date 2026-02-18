import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

@Controller()
@SkipThrottle()
export class HealthController {
  @Get('/health')
  check() {
    return {
      status: 'Vamos iniciar o desenvolvimento do Nexo Platform!',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('/metrics')
  metrics() {
    return {
      status: 'Vamos iniciar o desenvolvimento do Nexo Platform!',
      timestamp: new Date().toISOString(),
    };
  }
}
