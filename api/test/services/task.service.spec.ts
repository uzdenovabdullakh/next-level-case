import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../../src/models/task.entity';
import { AmqpService } from '../../src/services/amqp.service';
import { TaskService } from '../../src/services/task.service';
import { CreateTaskDto } from '../../src/dto/create-task.dto';

describe('TaskService', () => {
  let service: TaskService;
  let taskRepository: Repository<Task>;
  let amqpService: AmqpService;

  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    priority: 'high',
    createdAt: new Date(),
  };

  const mockTaskRepository = {
    create: jest.fn().mockReturnValue(mockTask),
    save: jest.fn().mockResolvedValue(mockTask),
    findOneBy: jest.fn().mockResolvedValue(mockTask),
    findAndCount: jest.fn().mockResolvedValue([[mockTask], 1]),
  };

  const mockAmqpService = {
    sendTaskToQueue: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: AmqpService,
          useValue: mockAmqpService,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    amqpService = module.get<AmqpService>(AmqpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTask', () => {
    it('should create and save a task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high'
      };

      const result = await service.createTask(createTaskDto);

      expect(taskRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        status: 'pending',
      });
      expect(taskRepository.save).toHaveBeenCalledWith(mockTask);
      expect(amqpService.sendTaskToQueue).toHaveBeenCalledWith(mockTask);
      expect(result).toEqual(mockTask);
    });
  });

  describe('getTask', () => {
    it('should return a task by id', async () => {
      const result = await service.getTask('1');

      expect(taskRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(result).toEqual(mockTask);
    });
  });

  describe('getTasks', () => {
    it('should return paginated tasks', async () => {
      const page = 1;
      const limit = 10;
      const result = await service.getTasks(page, limit);

      expect(taskRepository.findAndCount).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        skip: 0,
        take: limit,
      });
      expect(result).toEqual({
        tasks: [mockTask],
        total: 1,
        page,
        limit,
      });
    });
  });
});