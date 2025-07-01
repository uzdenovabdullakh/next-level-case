import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { TaskService } from '../services/task.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('tasks')
@Controller('api/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(@Body() dto: CreateTaskDto) {
    return this.taskService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.taskService.findAll(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get all tasks with pagination' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(id);
  }
}