import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Task } from '../models/task.entity';

@Injectable()
export class AmqpService {
  private readonly logger = new Logger(AmqpService.name);

  constructor(@Inject('RABBITMQ_CLIENT') private client: ClientProxy) {}

  async sendTaskToQueue(task: Task) {
    try {
      await this.client.emit('task_created', task).toPromise();
      this.logger.log(`Task ${task.id} sent to RabbitMQ`);
    } catch (error) {
      this.logger.error(`Failed to send task to queue: ${error.message}`);
      throw error;
    }
  }
}