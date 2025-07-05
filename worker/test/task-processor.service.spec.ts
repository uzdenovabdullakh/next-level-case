import { Test, TestingModule } from '@nestjs/testing';
import { TaskProcessorService } from '../src/task-processor.service';
import { Repository } from 'typeorm';
import { Task } from '../src/task.entity';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('TaskProcessorService', () => {
  let service: TaskProcessorService;
  let taskRepository: Repository<Task>;
  let configService: ConfigService;

  const mockTask = {
    id: '123',
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending' as const,
    priority: 'medium' as const,
    createdAt: new Date(),
    startedAt: null,
    completedAt: null,
  };

  const mockTaskRepository = {
    findOneBy: jest.fn(),
    save: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(100),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskProcessorService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<TaskProcessorService>(TaskProcessorService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('process', () => {
    it('should return undefined if task is not found', async () => {
      mockTaskRepository.findOneBy.mockResolvedValue(null);

      const result = await service.process('123');

      expect(result).toBeUndefined();
      expect(mockTaskRepository.findOneBy).toHaveBeenCalledWith({ id: '123' });
      expect(mockTaskRepository.save).not.toHaveBeenCalled();
    });

    it('should process task and update status to processing and then completed', async () => {
      jest.useFakeTimers({ advanceTimers: true });
      mockTaskRepository.findOneBy.mockResolvedValue(mockTask);
      mockTaskRepository.save.mockResolvedValue(mockTask);

      const processPromise = service.process('123');

      await Promise.resolve();

      expect(mockTaskRepository.findOneBy).toHaveBeenCalledWith({ id: '123' });
      expect(mockTaskRepository.save).toHaveBeenCalledTimes(1);
      expect(mockTaskRepository.save).toHaveBeenNthCalledWith(1, {
        ...mockTask,
        status: 'processing',
        startedAt: expect.any(Date),
      });

      
      jest.advanceTimersByTime(100);
      await processPromise;

      expect(mockTaskRepository.save).toHaveBeenCalledTimes(2);
      expect(mockTaskRepository.save).toHaveBeenNthCalledWith(2, {
        ...mockTask,
        status: 'completed',
        startedAt: expect.any(Date),
        completedAt: expect.any(Date),
      });
      expect(configService.get).toHaveBeenCalledWith('WORKER_TIMEOUT');
    }, 10000);

    it('should handle errors during task processing', async () => {
      mockTaskRepository.findOneBy.mockResolvedValue(mockTask);
      mockTaskRepository.save.mockRejectedValueOnce(new Error('Save failed'));

      await expect(service.process('123')).rejects.toThrow('Save failed');
      expect(mockTaskRepository.findOneBy).toHaveBeenCalledWith({ id: '123' });
      expect(mockTaskRepository.save).toHaveBeenCalledWith({
        ...mockTask,
        status: 'processing',
        startedAt: expect.any(Date),
      });
    });
  });
});