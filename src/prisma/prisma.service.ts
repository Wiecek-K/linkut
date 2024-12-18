import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly maxRetries = 5;
  private readonly retryDelay = 2000;
  async onModuleInit() {
    await this.retryConnect();
  }

  private async retryConnect(attempt = 1): Promise<void> {
    try {
      console.log(`Attempt ${attempt} to connect to database...`);
      await this.$connect();
      console.log('Database connected successfully!');
    } catch (error) {
      if (attempt < this.maxRetries) {
        console.warn(
          `Failed to connect to database. Retrying in ${this.retryDelay / 1000}s...`,
        );
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return this.retryConnect(attempt + 1);
      }
      console.error(
        'Unable to connect to the database after several attempts:',
        error,
      );
      throw error;
    }
  }
}
