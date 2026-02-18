import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

@Controller()
@SkipThrottle()
export class HealthController {
  @Get('/health')
  check() {
    return {
      status: 'TEST API is healthy1',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('/metrics')
  metrics() {
    return {
      status: 'TEST API is healthy1',
      timestamp: new Date().toISOString(),
    };
  }
}
