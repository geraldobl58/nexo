import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

@Controller()
@SkipThrottle()
export class HealthController {
  @Get('/health')
  check() {
    return {
      status: 'API is healthy and running!',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('/metrics')
  metrics() {
    return {
      status: 'API metrics are available!',
      timestamp: new Date().toISOString(),
    };
  }
}
