import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { Request } from 'express';
import { JwtUserPayload } from 'src/types/JwtUserPayload';
import { getFullUrl } from 'src/utils/getFullUrl';

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Get('user') //  GET /links/user
  async getUsersLinks(@Req() req: Request) {
    const { sub } = req.user as JwtUserPayload;

    const links = await this.linksService.findLinksByUser(sub, req);

    if (!links) {
      throw new HttpException('Nie znaleziono linków', HttpStatus.NOT_FOUND);
    }

    return links;
  }

  @Get('stats/:shortUrlCode') //  GET /links/stats/:id
  async getLinkStats(
    @Param('shortUrlCode') shortUrlCode: string,
    @Req() req: Request,
  ) {
    const { sub } = req.user as JwtUserPayload;

    const linkStats = await this.linksService.findLinkStatistics(
      shortUrlCode,
      sub,
    );

    if (!linkStats) {
      throw new HttpException('Nie znaleziono statystyk', HttpStatus.NOT_FOUND);
    }

    return linkStats;
  }

  //TODO: make guard decorator : Only for Admin
  @Get() // GET   /links
  async getAllLinks() {
    return await this.linksService.findAll();
  }

  @Post('generate') //POST  /links/generate
  async createLink(
    @Body(ValidationPipe) createLinkDto: CreateLinkDto,
    @Req() req: Request,
  ) {
    const { sub } = req.user as JwtUserPayload;
    const protocol = req.protocol;
    const host = req.get('host');

    const shortUrlCode = (await this.linksService.create(createLinkDto, sub))
      .shortUrlCode;

    return getFullUrl(
      protocol,
      host,
      `${process.env.CONVERT_SHORT_TO_ORGINAL_URL_ENDPOINT}/${shortUrlCode}`,
    );
  }
}
