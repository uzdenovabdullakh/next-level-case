import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonLoggerService } from './logger.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const logger = app.get('LOGGER') as WinstonLoggerService;

  const shutdown = async () => {
    logger.log({ message: 'Received shutdown signal' }, 'Bootstrap');
    await app.close();
    logger.log({ message: 'Application closed' }, 'Bootstrap')
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  process.on('unhandledRejection', (reason) => {
    logger.error({ message: 'Unhandled Rejection', error: reason }, undefined, 'Bootstrap');
  });
  process.on('uncaughtException', (err) => {
    logger.error({ message: 'Uncaught Exception', error: err.message, stack: err.stack }, undefined, 'Bootstrap');
  });
}
bootstrap();