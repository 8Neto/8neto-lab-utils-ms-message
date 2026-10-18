import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { DOCKER_PORT, DOMAIN, ENV } from './config/index.js';
import type { IResponse } from './interfaces/index.js';
@Injectable()
export class AppService {
  constructor(private readonly i18n: I18nService) {}

  health(): IResponse {
    console.log('HEALTH-SERVICE');
    return {
      statusCode: 200,
      message: this.i18n.t('success.HEALTH.OK', {
        lang: I18nContext.current()?.lang,
      }),
      data: {
        domain: DOMAIN,
        port: DOCKER_PORT,
        env: ENV,
      },
    };
  }
}
