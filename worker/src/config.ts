import dotenv from 'dotenv';

dotenv.config();

export const config = {
  RABBITMQ_URL: process.env.RABBITMQ_URL,
  RABBITMQ_QUEUE_NAME: process.env.RABBITMQ_QUEUE_NAME,
  WORKER_TIMEOUT: process.env.WORKER_TIMEOUT,
  DATABASE_URL: process.env.DATABASE_URL,
};