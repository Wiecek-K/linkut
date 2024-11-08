import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { LinksController } from './links/links.controller';
import { LinksModule } from './links/links.module';
import { LinksService } from './links/links.service';

@Module({
  imports: [UsersModule, PrismaModule, LinksModule],
  controllers: [AppController, LinksController],
  providers: [AppService, PrismaService, LinksService],
})
export class AppModule {}
