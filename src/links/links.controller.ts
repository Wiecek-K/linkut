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
  ValidationPipe,
} from '@nestjs/common';
import { LinksService } from './links.service';
import { Link, Prisma } from '@prisma/client';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';

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
  async createLink(@Body(ValidationPipe) createLinkDto: CreateLinkDto) {
    return await this.linksService.create(createLinkDto);
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
