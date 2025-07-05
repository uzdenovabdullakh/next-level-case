import { Test, TestingModule } from '@nestjs/testing';
import { WorkerService } from '../src/worker.service';
import { TaskProcessorService } from '../src/task-processor.service';
import { ConfigService } from '@nestjs/config';
import { connect } from 'amqplib';

jest.mock('amqplib');

describe('WorkerService', () => {
  let service: WorkerService;
  let taskProcessorService: TaskProcessorService;
  let configService: ConfigService;
  let mockChannel: any;
  let mockConnection: any;

  const mockTask = {
    id: '123',
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockChannel = {
      assertQueue: jest.fn().mockResolvedValue(undefined),
      consume: jest.fn(),
      ack: jest.fn(),
      nack: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn().mockResolvedValue(undefined),
    };

    (connect as jest.Mock).mockResolvedValue(mockConnection);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkerService,
        {
          provide: TaskProcessorService,
          useValue: {
            process: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn()
              .mockImplementation((key: string) => {
                if (key === 'RABBITMQ_URL') return 'amqp://localhost';
                if (key === 'RABBITMQ_QUEUE_NAME') return 'tasks';
                return undefined;
              }),
          },
        },
      ],
    }).compile();

    service = module.get<WorkerService>(WorkerService);
    taskProcessorService = module.get<TaskProcessorService>(TaskProcessorService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should connect to RabbitMQ and start consuming messages', async () => {
      await service.onModuleInit();

      expect(connect).toHaveBeenCalledWith('amqp://localhost');
      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockChannel.assertQueue).toHaveBeenCalledWith('tasks', { durable: true });
      expect(mockChannel.consume).toHaveBeenCalledWith('tasks', expect.any(Function), { noAck: false });
      expect(configService.get).toHaveBeenCalledWith('RABBITMQ_URL');
      expect(configService.get).toHaveBeenCalledWith('RABBITMQ_QUEUE_NAME');
    });

    it('should process valid messages', async () => {
      await service.onModuleInit();
      const consumeCallback = mockChannel.consume.mock.calls[0][1];
      const mockMessage = {
        content: Buffer.from(JSON.stringify({ pattern: 'task', data: mockTask })),
      };

      await consumeCallback(mockMessage);

      expect(taskProcessorService.process).toHaveBeenCalledWith(mockTask.id);
      expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
    });

    it('should nack messages on processing error', async () => {
      await service.onModuleInit();
      const consumeCallback = mockChannel.consume.mock.calls[0][1];
      const mockMessage = {
        content: Buffer.from(JSON.stringify({ pattern: 'task', data: mockTask })),
      };
      (taskProcessorService.process as jest.Mock).mockRejectedValueOnce(new Error('Processing failed'));

      await consumeCallback(mockMessage);

      expect(taskProcessorService.process).toHaveBeenCalledWith(mockTask.id);
      expect(mockChannel.nack).toHaveBeenCalledWith(mockMessage, false, false);
    });
  });

  describe('onModuleDestroy', () => {
    it('should close channel and connection gracefully', async () => {
      await service.onModuleInit();
      await service.onModuleDestroy();

      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });
  });
});