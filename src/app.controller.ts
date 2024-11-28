import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/auth.decorator';
import { LinksService } from './links/links.service';
import { Request, Response } from 'express';
import { getFullUrl } from './utils/getFullUrl';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly linksService: LinksService,
  ) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get(`${process.env.CONVERT_SHORT_TO_ORGINAL_URL_ENDPOINT}/:shortUrlCode`)
  async getLinkByshortUrlCode(
    @Req() req: Request,
    @Param('shortUrlCode') shortUrlCode: string,
    @Res() res: Response,
    @Query('ref') ref?: string,
  ) {
    const protocol = req.protocol;
    const host = req.get('host');

    const originalUrl = await this.linksService.menageShortLinkClick(
      shortUrlCode,
      ref,
    );

    if (!originalUrl) {
      throw new HttpException('Nie znaleziono linku', HttpStatus.FORBIDDEN);
    }

    if (
      originalUrl.includes(
        getFullUrl(
          protocol,
          host,
          `${process.env.CONVERT_SHORT_TO_ORGINAL_URL_ENDPOINT}`,
        ),
      )
    ) {
      throw new HttpException(
        'Niedozwolone przekierowanie',
        HttpStatus.FORBIDDEN,
      );
    }

    return res.redirect(302, originalUrl);
  }
}
