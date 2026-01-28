import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Status de resposta da API' })
  @ApiResponse({
    status: 200,
    description:
      'API está funcionando e saudável, fornece informações de status.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2026-01-21T12:00:00.000Z' },
        uptime: { type: 'number', example: 123.456 },
        memoryUsage: {
          type: 'object',
          example: {
            rss: 12345678,
            heapTotal: 1234567,
            heapUsed: 1234567,
            external: 123456,
          },
        },
      },
    },
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
