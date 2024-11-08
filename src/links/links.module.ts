import { Module } from '@nestjs/common';
import { LinksService } from './links.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LinksController } from './links.controller';

@Module({
  imports: [PrismaModule],
  providers: [LinksService],
  controllers: [LinksController],
})
export class LinksModule {}
