import { Module } from '@nestjs/common';
import { LinksService } from './links.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LinksController } from './links.controller';
import { UrlService } from 'src/url/url.service';

@Module({
  imports: [PrismaModule],
  providers: [LinksService, UrlService],
  controllers: [LinksController],
})
export class LinksModule {}
