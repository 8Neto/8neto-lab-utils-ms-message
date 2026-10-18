import { Injectable, type OnApplicationShutdown } from '@nestjs/common';

@Injectable()
export class TelemetryShutdown implements OnApplicationShutdown {
  shutdown: () => Promise<void> = async () => {};

  async onApplicationShutdown(): Promise<void> {
    await this.shutdown();
  }
}
