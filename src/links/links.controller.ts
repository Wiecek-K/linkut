import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { Request } from 'express';
import { JwtUserPayload } from 'src/types/JwtUserPayload';
import { UrlService } from 'src/url/url.service';

@Controller('links')
export class LinksController {
  constructor(
    private readonly linksService: LinksService,
    private readonly urlService: UrlService,
  ) {}

  @Get('user') //  GET /links/user
  async getUsersLinks(@Req() req: Request) {
    const { sub } = req.user as JwtUserPayload;

    const links = await this.linksService.findLinksByUser(sub);

    if (!links) {
      throw new HttpException('Nie znaleziono linków', HttpStatus.NOT_FOUND);
    }

    return links;
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

    const shortUrlCode = (await this.linksService.create(createLinkDto, sub))
      .shortUrlCode;

    return this.urlService.getFullUrl(
      `${process.env.CONVERT_SHORT_TO_ORGINAL_URL_ENDPOINT}/${shortUrlCode}`,
    );
  }

  @Patch(':id') //  PATCH /links/:id
  async updateLink(
    @Param('id') id: string,
    @Body(ValidationPipe) updateLinkDto: UpdateLinkDto,
  ) {
    const updatedLink = await this.linksService.update(id, updateLinkDto);
    if (!updatedLink) {
      throw new HttpException('Nie znaleziono linku', HttpStatus.NOT_FOUND);
    }
    return updatedLink;
  }

  @Delete(':id') //  DELETE /links/:id
  async deleteLink(@Param('id') id: string) {
    const deletedLink = await this.linksService.delete(id);
    if (!deletedLink) {
      throw new HttpException('Nie znaleziono linku', HttpStatus.NOT_FOUND);
    }
    return deletedLink;
  }
}
