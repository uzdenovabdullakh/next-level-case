import { Injectable, OnModuleDestroy, Inject } from '@nestjs/common';
import { connect, Channel, ChannelModel } from 'amqplib';
import { TaskProcessorService } from './task-processor.service';
import { ConfigService } from '@nestjs/config';
import { Task } from './task.entity';
import { WinstonLoggerService } from './logger.service';

interface MessageContent<T> {
  pattern: string
  data: T
}

@Injectable()
export class WorkerService implements OnModuleDestroy {
  private conn: ChannelModel;
  private channel: Channel;

  constructor(
    private readonly processor: TaskProcessorService,
    private configService: ConfigService,
    @Inject('LOGGER') private readonly logger: WinstonLoggerService
  ) { }

  async onModuleInit() {
    const queue = this.configService.get<string>('RABBITMQ_QUEUE_NAME') || 'tasks';

    this.conn = await connect(this.configService.get<string>('RABBITMQ_URL') || 'amqp://localhost');
    this.channel = await this.conn.createChannel();
    await this.channel.assertQueue(queue, { durable: true });

    this.logger.log({ message: 'Waiting for messages', queue }, WorkerService.name);

    this.channel.consume(
      queue,
      async (msg) => {
        if (msg) {
          const { data: task }: MessageContent<Task> = JSON.parse(msg.content.toString());

          this.logger.log({ message: 'Received task', taskId: task.id }, WorkerService.name);

          try {
            await this.processor.process(task.id);
            this.channel.ack(msg);

            this.logger.log({ message: 'Task processed successfully', taskId: task.id }, WorkerService.name);
          } catch (error) {
            this.logger.error(
              { message: 'Failed to process task', taskId: task.id, error: error.message },
              error.stack,
              WorkerService.name,
            );

            this.channel.nack(msg, false, false); // не повторять, отбросить
          }
        }
      },
      { noAck: false },
    );
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.conn?.close();
    this.logger.log({ message: 'Worker gracefully shut down' }, WorkerService.name);
  }
}