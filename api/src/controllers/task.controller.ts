import { Controller, Get, Post, Body, Param, Query, Logger, NotFoundException } from '@nestjs/common';
import { TaskService } from '../services/task.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('tasks')
@Controller('api/tasks')
export class TaskController {
  private readonly logger = new Logger(TaskController.name);

  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createTask(@Body() dto: CreateTaskDto) {
    this.logger.log(`Creating task: ${JSON.stringify(dto)}`);
    return await this.taskService.createTask(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with pagination' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  async getTasks(@Query('page') page = 1, @Query('limit') limit = 10) {
    this.logger.log(`Fetching tasks with page: ${page}, limit: ${limit}`);
    return this.taskService.getTasks(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getTask(@Param('id') id: string) {
    this.logger.log(`Fetching task with ID: ${id}`);
    const task = await this.taskService.getTask(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }
}