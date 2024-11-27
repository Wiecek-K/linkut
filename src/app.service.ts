import { Injectable, Logger } from '@nestjs/common';
import { LinksService } from './links/links.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AppService {
  constructor(private linksService: LinksService) {}
  private readonly logger = new Logger(AppService.name);

  getHello(): string {
    return 'Hello World!';
  }

  @Cron(CronExpression.EVERY_HOUR)
  async deleteExpiredLinks() {
    try {
      await this.linksService.deleteExpired();
    } catch (error) {
      this.logger.error('Cron job failed', error);
    }
  }
}
