import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from '../../src/controllers/task.controller';
import { TaskService } from '../../src/services/task.service';
import { CreateTaskDto } from '../../src/dto/create-task.dto';
import { NotFoundException } from '@nestjs/common';

describe('TaskController', () => {
  let controller: TaskController;
  let taskService: TaskService;

  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    priority: 'high',
    createdAt: new Date(),
  };

  const mockTaskService = {
    createTask: jest.fn().mockResolvedValue(mockTask),
    getTask: jest.fn().mockResolvedValue(mockTask),
    getTasks: jest.fn().mockResolvedValue({
      tasks: [mockTask],
      total: 1,
      page: 1,
      limit: 10,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    taskService = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTask', () => {
    it('should create a task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high'
      };

      const result = await controller.createTask(createTaskDto);

      expect(taskService.createTask).toHaveBeenCalledWith(createTaskDto);
      expect(result).toEqual(mockTask);
    });
  });

  describe('getTask', () => {
    it('should return a task by id', async () => {
      const result = await controller.getTask('1');

      expect(taskService.getTask).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockTaskService.getTask.mockResolvedValueOnce(null);

      await expect(controller.getTask('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTasks', () => {
    it('should return paginated tasks', async () => {
      const result = await controller.getTasks(1, 10);

      expect(taskService.getTasks).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual({
        tasks: [mockTask],
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });
});