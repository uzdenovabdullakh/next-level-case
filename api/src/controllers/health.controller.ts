import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WinstonLoggerService } from 'src/services/logger.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
    private configService: ConfigService,
    @Inject('LOGGER') private readonly logger: WinstonLoggerService
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async check() {
    this.logger.log({ message: 'Performing health check' }, HealthController.name);
    
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 1500 }),
      () =>
        this.microservice.pingCheck('rabbitmq', {
          transport: Transport.RMQ,
          options: {
            urls: [this.configService.get<string>('RABBITMQ_URL')],
            queue: this.configService.get<string>('RABBITMQ_QUEUE_NAME'),
          },
        }),
    ]);
  }
}