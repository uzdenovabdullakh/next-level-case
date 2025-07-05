import { Controller, Get, Post, Body, Param, Query, NotFoundException, Inject } from '@nestjs/common';
import { TaskService } from '../services/task.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WinstonLoggerService } from 'src/services/logger.service';

@ApiTags('tasks')
@Controller('api/tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService, 
    @Inject('LOGGER') private readonly logger: WinstonLoggerService
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createTask(@Body() dto: CreateTaskDto) {
    this.logger.log({ message: 'Creating task', data: dto }, TaskController.name);
    
    return await this.taskService.createTask(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with pagination' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  async getTasks(@Query('page') page = 1, @Query('limit') limit = 10) {
    this.logger.log({ message: 'Fetching tasks', page, limit }, TaskController.name);

    return this.taskService.getTasks(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getTask(@Param('id') id: string) {
    this.logger.log({ message: 'Fetching task', taskId: id }, TaskController.name);

    const task = await this.taskService.getTask(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }
}