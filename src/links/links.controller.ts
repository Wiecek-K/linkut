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
} from '@nestjs/common';
import { LinksService } from './links.service';
import { Link, Prisma } from '@prisma/client';

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Get() // GET   /links
  async getAllLinks() {
    return await this.linksService.findAll();
  }

  @Get(':id') //  GET /links/:id
  async getLinkById(@Param('id') id: string) {
    const link = await this.linksService.findOne(id);
    if (!link) {
      throw new HttpException('Nie znaleziono linku', HttpStatus.NOT_FOUND);
    }
    return link;
  }

  @Post() //POST  /links
  async createLink(@Body() linkDto: Prisma.LinkCreateInput) {
    return await this.linksService.create(linkDto);
  }

  @Patch(':id') //  PATCH /links/:id
  async updateLink(@Param('id') id: string, @Body() linkDto: Link) {
    const updatedLink = await this.linksService.update(id, linkDto);
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