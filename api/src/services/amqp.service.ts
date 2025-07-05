import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Task } from '../models/task.entity';
import { WinstonLoggerService } from './logger.service';

@Injectable()
export class AmqpService {
  constructor(
    @Inject('RABBITMQ_CLIENT') private client: ClientProxy,
    @Inject('LOGGER') private readonly logger: WinstonLoggerService
  ) { }

  async sendTaskToQueue(task: Task) {
    try {
      await this.client.emit('task_created', task).toPromise();
      this.logger.log({ message: 'Task sent to RabbitMQ', taskId: task.id }, AmqpService.name);
    } catch (error) {
      this.logger.error(
        { message: 'Failed to send task to queue', taskId: task.id, error: error.message },
        error.stack,
        AmqpService.name,
      );
      throw error;
    }
  }
}