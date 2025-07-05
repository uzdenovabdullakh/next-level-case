import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../models/task.entity';
import { CreateTaskDto } from '../dto/create-task.dto';
import { AmqpService } from './amqp.service';
import { WinstonLoggerService } from './logger.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly repo: Repository<Task>,
    private amqpService: AmqpService,
    @Inject('LOGGER') private readonly logger: WinstonLoggerService
  ) { }

  async createTask(dto: CreateTaskDto) {
    const task = this.repo.create({ ...dto, status: 'pending' });
    const saved = await this.repo.save(task);

    await this.amqpService.sendTaskToQueue(task);
    
    this.logger.log({ message: 'Task sent to queue', taskId: task.id }, TaskService.name);

    return saved;
  }

  async getTask(id: string) {
    return this.repo.findOneBy({ id });
  }

  async getTasks(page: number, limit: number) {
    const [tasks, total] = await this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { tasks, total, page, limit };
  }
}