import { Injectable, NotFoundException } from '@nestjs/common';
import { Link, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';

@Injectable()
export class LinksService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: Link['id']): Promise<Link | null> {
    try {
      return await this.prisma.link.findFirst({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Link with ID "${id}" not found.`);
      } else {
        throw new Error(`Error fetching link with ID "${id}"`);
      }
    }
  }

  async findAll(): Promise<Link[] | null> {
    try {
      return await this.prisma.link.findMany();
    } catch (error) {
      throw new Error('Error fetching links');
    }
  }

  async create(createLinkDto: CreateLinkDto): Promise<Link | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: createLinkDto.userId },
      });

      if (!user) {
        throw new NotFoundException(
          `User with id ${createLinkDto.userId} not found`,
        );
      }

      return await this.prisma.link.create({ data: createLinkDto });
    } catch (error) {
      throw new Error('Error creating link');
    }
  }

  async update(
    id: Link['id'],
    updateLinkDto: UpdateLinkDto,
  ): Promise<Link | null> {
    try {
      return await this.prisma.link.update({
        where: { id },
        data: updateLinkDto,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Link with ID "${id}" not found.`);
      } else {
        throw new Error(`Error updating link with ID "${id}"`);
      }
    }
  }

  async delete(id: Link['id']): Promise<Link | null> {
    try {
      return await this.prisma.link.delete({ where: { id } });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Link with ID "${id}" not found.`);
      } else {
        throw new Error(`Error deleting link with ID "${id}"`);
      }
    }
  }
}
