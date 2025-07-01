import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from '../controllers/task.controller';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TasksModule {}