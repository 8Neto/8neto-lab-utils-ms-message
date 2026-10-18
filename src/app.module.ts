import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { OpenTelemetryModule } from 'nestjs-otel';
import { join } from 'node:path';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { MONGO_DATABASE, MONGO_URL } from './config/environment.js';
import { TelemetryShutdown } from './otlp/telemetry-shutdown.js';

@Module({
  imports: [
    MongooseModule.forRoot(`mongodb://${MONGO_URL}/${MONGO_DATABASE}`),
    OpenTelemetryModule.forRoot({ metrics: { hostMetrics: true } }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(import.meta.dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, TelemetryShutdown],
})
export class AppModule {}
