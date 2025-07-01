import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AmqpService } from '../services/amqp.service';
import { ClientProxyFactory, Transport, ClientOptions } from '@nestjs/microservices';

@Module({
  imports: [ConfigModule],
  providers: [
    AmqpService,
    {
      provide: 'RABBITMQ_CLIENT',
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('RABBITMQ_URL');
        const queue = configService.get<string>('RABBITMQ_QUEUE_NAME');
      
        if (!url || !queue) {
          throw new Error('Missing RabbitMQ configuration: RABBITMQ_URL or RABBITMQ_QUEUE_NAME');
        }
      
        const options: ClientOptions = {
          transport: Transport.RMQ,
          options: {
            urls: [url],
            queue,
            queueOptions: { durable: true },
          },
        };
      
        return ClientProxyFactory.create(options);
      },
      inject: [ConfigService],
    },
  ],
  exports: [AmqpService],
})
export class AmqpModule {}
