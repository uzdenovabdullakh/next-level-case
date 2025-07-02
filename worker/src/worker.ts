import * as amqplib from 'amqplib';
import { processTask } from './taskProcessor';
import { config } from './config';

let connection: amqplib.ChannelModel;

const start = async () => {
  try {
    connection = await amqplib.connect(config.RABBITMQ_URL!);
    const channel: amqplib.Channel = await connection.createChannel();

    const queue = config.RABBITMQ_QUEUE_NAME!;
    await channel.assertQueue(queue, { durable: true });

    console.log(` [*] Waiting for messages in ${queue}. To exit press CTRL+C`);

    channel.consume(
      queue,
      async (msg: amqplib.ConsumeMessage | null) => {
        if (msg) {
          const task = JSON.parse(msg.content.toString());
          await processTask(task);
          channel.ack(msg);
        }
      },
      { noAck: false }
    );

    process.on('SIGTERM', async () => {
      console.log(' [x] Received SIGTERM, closing gracefully...');
      await channel.close();
      await connection.close();
      process.exit(0);
    });
  } catch (err) {
    console.error('Worker startup error:', err);
    process.exit(1);
  }
};

start();