import { Controller, Get, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Response } from 'express';
import { register, collectDefaultMetrics } from 'prom-client';

collectDefaultMetrics({ prefix: 'nexo_be_' });

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
  async metrics(@Res() res: Response): Promise<void> {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  }
}
