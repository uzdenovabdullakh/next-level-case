import { Injectable } from '@nestjs/common';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TaskProcessorService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private configService: ConfigService,
  ) { }

  async process(taskId: string) {
    const task = await this.taskRepo.findOneBy({ id: taskId });
    if (!task) return;

    task.status = 'processing';
    task.startedAt = new Date();
    await this.taskRepo.save(task);

    const timeout = this.configService.get<number>('WORKER_TIMEOUT') || 600_000;

    await new Promise<void>((resolve, reject) => {
      setTimeout(async () => {
        try {
          task.status = 'completed';
          task.completedAt = new Date();
          await this.taskRepo.save(task);
  
          console.log(`Task completed: ${task.id}`);
          resolve();
        } catch (error) {
          console.error(`Error completing task ${task.id}:`, error);
          reject(error);
        }
      }, timeout);
    });
  }
}