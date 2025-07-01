import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './modules/tasks.module';
import { Task } from './models/task.entity';
import { HealthModule } from './modules/health.module';
import { AmqpModule } from './modules/amqp.module';

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
    TasksModule,
    HealthModule,
    AmqpModule
  ],
})
export class AppModule {}