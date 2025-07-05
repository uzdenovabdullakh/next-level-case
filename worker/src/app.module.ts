import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WorkerService } from './worker.service';
import { TaskProcessorService } from './task-processor.service';
import { WinstonLoggerService } from './logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [Task],
        synchronize: true, // NOTE: для тестового задания, на проде естественно миграции
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Task]),
  ],
  providers: [WorkerService, TaskProcessorService, {
    provide: 'LOGGER',
    useClass: WinstonLoggerService,
  },],
})
export class AppModule { }