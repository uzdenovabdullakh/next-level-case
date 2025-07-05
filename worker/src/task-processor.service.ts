import { Injectable, Inject } from '@nestjs/common';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { WinstonLoggerService } from './logger.service';

@Injectable()
export class TaskProcessorService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private configService: ConfigService,
    @Inject('LOGGER') private readonly logger: WinstonLoggerService,
  ) { }

  async process(taskId: string) {
    const task = await this.taskRepo.findOneBy({ id: taskId });
    if (!task) {
      this.logger.warn({ message: 'Task not found', taskId }, TaskProcessorService.name);
      return;
    }

    task.status = 'processing';
    task.startedAt = new Date();
    await this.taskRepo.save(task);

    this.logger.log({ message: 'Task processing started', taskId }, TaskProcessorService.name);

    const timeout = this.configService.get<number>('WORKER_TIMEOUT') || 600_000;

    await new Promise<void>((resolve, reject) => {
      setTimeout(async () => {
        try {
          task.status = 'completed';
          task.completedAt = new Date();
          await this.taskRepo.save(task);

          this.logger.log({ message: 'Task completed', taskId }, TaskProcessorService.name);
          resolve();
        } catch (error) {
          this.logger.error(
            { message: 'Error completing task', taskId, error: error.message },
            error.stack,
            TaskProcessorService.name,
          );
          reject(error);
        }
      }, timeout);
    });
  }
}