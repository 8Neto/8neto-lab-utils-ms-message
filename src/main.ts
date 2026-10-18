import { telemetryLifecycle } from './otlp/telemetry.js';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { I18nValidationExceptionFilter } from 'nestjs-i18n';
import { AppModule } from './app.module.js';
import { DOCKER_PORT } from './config/index.js';
import { TelemetryShutdown } from './otlp/telemetry-shutdown.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.get(TelemetryShutdown).shutdown =
    telemetryLifecycle.onApplicationShutdown;
  app.enableShutdownHooks();
  const config = new DocumentBuilder()
    .setTitle('Message Service')
    .setDescription('API for send messages')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: false,
    }),
  );

  await app.listen(DOCKER_PORT ?? 8084);
}
bootstrap();
