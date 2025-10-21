import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { ServiceUnavailableException } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health Check' })
  @ApiResponse({
    status: 200,
    description: 'The service is healthy.',
    schema: {
      example: {
        status: 'ok',
        database: 'connected',
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'The service is unhealthy.',
  })
  async check() {
    const result = await this.healthService.check();

    if (result.status === 'error') {
      throw new ServiceUnavailableException(result);
    }

    return result;
  }
}
