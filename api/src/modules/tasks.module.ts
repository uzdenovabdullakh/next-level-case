import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from '../controllers/task.controller';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.entity';
import { AmqpService } from '../services/amqp.service';
import { AmqpModule } from './amqp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    AmqpModule
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TasksModule {}