import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { LinksService } from 'src/links/links.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(
    private prismaService: PrismaService,
    // private linksService: LinksService,
  ) {}

  private readonly logger = new Logger(TasksService.name);
  log() {
    this.logger.log('TEST');
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async dupa() {
    this.logger.debug('Called every 30 second');
    this.log();

    try {
      // const res = await this.prismaService.user.create({
      //   data: { email: 'pop@mail.com', password: 'test' },
      // });
      const now = new Date();
      const hours48Ago = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      const res = await this.prismaService.link.deleteMany({
        where: { createdAt: { lt: hours48Ago } },
      });
      this.logger.debug(res);
      // await this.linksService.deleteExpired();
    } catch (error) {
      // Add error handling
      this.logger.error('Cron job failed', error);
    }
  }
}
