import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { LinksModule } from 'src/links/links.module';
import { LinksService } from 'src/links/links.service';
import { UrlService } from 'src/url/url.service';

@Module({
  imports: [LinksModule],
  providers: [TasksService, LinksService, UrlService],
})
export class TasksModule {}
