import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../../src/controllers/health.controller';
import { HealthCheckService, TypeOrmHealthIndicator, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;

  const mockHealthCheckService = {
    check: jest.fn().mockResolvedValue({ status: 'ok', details: { database: { status: 'up' }, rabbitmq: { status: 'up' } } }),
  };

  const mockTypeOrmHealthIndicator = {
    pingCheck: jest.fn().mockResolvedValue({ database: { status: 'up' } }),
  };

  const mockMicroserviceHealthIndicator = {
    pingCheck: jest.fn().mockResolvedValue({ rabbitmq: { status: 'up' } }),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'RABBITMQ_URL') return 'amqp://localhost';
      if (key === 'RABBITMQ_QUEUE_NAME') return 'test_queue';
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: mockTypeOrmHealthIndicator,
        },
        {
          provide: MicroserviceHealthIndicator,
          useValue: mockMicroserviceHealthIndicator,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health check status', async () => {
      const result = await controller.check();

      expect(healthCheckService.check).toHaveBeenCalled();
      expect(result).toEqual({
        status: 'ok',
        details: {
          database: { status: 'up' },
          rabbitmq: { status: 'up' },
        },
      });
    });
  });
});