import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/auth.decorator';
import { LinksService } from './links/links.service';
import { UrlService } from './url/url.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly linksService: LinksService,
    private readonly urlService: UrlService,
  ) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get(`${process.env.CONVERT_SHORT_TO_ORGINAL_URL_ENDPOINT}/:shortUrlCode`) 
  async getLinkByshortUrlCode(
    @Param('shortUrlCode') shortUrlCode: string,
    @Res() res: Response,
  ) {
    const originalUrl = await this.linksService.findOrginalUrl(shortUrlCode);

    if (!originalUrl) {
      throw new HttpException('Nie znaleziono linku', HttpStatus.FORBIDDEN);
    }

    if (
      originalUrl.includes(
        this.urlService.getFullUrl(
          `${process.env.CONVERT_SHORT_TO_ORGINAL_URL_ENDPOINT}`,
        ),
      )
    ) {
      throw new HttpException(
        'Niedozwolone przekierowanie',
        HttpStatus.I_AM_A_TEAPOT,
      );
    }

    return res.redirect(302, originalUrl);
  }
}
