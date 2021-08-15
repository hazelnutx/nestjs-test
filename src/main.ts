import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './transform.interceptor';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);

  // When ever nestjs sees the validation decorators, it will automagically execute validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Use the transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(3000);
  logger.log(`Application listening on port 3000`);
}
bootstrap();
