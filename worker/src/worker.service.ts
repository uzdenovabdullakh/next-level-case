import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { connect, Channel, Connection, ChannelModel } from 'amqplib';
import { TaskProcessorService } from './task-processor.service';
import { ConfigService } from '@nestjs/config';
import { Task } from './task.entity';

interface MessageContent<T> {
  pattern: string
  data: T
}

@Injectable()
export class WorkerService implements OnModuleDestroy {
  private conn: ChannelModel;
  private channel: Channel;

  constructor(private readonly processor: TaskProcessorService, private configService: ConfigService) { }

  async onModuleInit() {
    const queue = this.configService.get<string>('RABBITMQ_QUEUE_NAME') || 'tasks';

    this.conn = await connect(this.configService.get<string>('RABBITMQ_URL') || 'amqp://localhost');
    this.channel = await this.conn.createChannel();
    await this.channel.assertQueue(queue, { durable: true });

    console.log(`Waiting for messages in ${queue}. To exit press CTRL+C`);

    this.channel.consume(
      queue,
      async (msg) => {
        if (msg) {
          const { data: task }: MessageContent<Task> = JSON.parse(msg.content.toString());

          console.log(`Received task: ${task.id}`);

          try {
            await this.processor.process(task.id);
            this.channel.ack(msg);
          } catch (error) {
            console.error(`Failed to process task ${task.id}:`, error);

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
    console.log('Worker gracefully shut down');
  }
}