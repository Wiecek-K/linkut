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

  @Post('/generate') //POST  /links/generate
  async createLink(
    @Body(ValidationPipe) createLinkDto: CreateLinkDto,
    @Req() req: Request,
  ) {
    const { sub } = req.user as JwtUserPayload;
    return await this.linksService.create(createLinkDto, sub);
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
