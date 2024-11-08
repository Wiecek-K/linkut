import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
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
    try {
      return await this.linksService.findAll();
    } catch (error) {
      throw new HttpException(
        'Error fetching links',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id') //  GET /links/:id
  async getLinkById(@Param('id') id: string) {
    try {
      return await this.linksService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          'Error fetching link',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Post() //POST  /links
  async createLink(@Body() linkDto: Prisma.LinkCreateInput) {
    try {
      return await this.linksService.create(linkDto);
    } catch (error) {
      throw new HttpException(
        'Error creating link',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id') //  PATCH /links/:id
  async updateLink(@Param('id') id: string, @Body() linkDto: Link) {
    try {
      return await this.linksService.update(id, linkDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          'Error fetching link',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Delete(':id') //  DELETE /links/:id
  async deleteLink(@Param('id') id: string) {
    try {
      return await this.linksService.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          'Error fetching link',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
