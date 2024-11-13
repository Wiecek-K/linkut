import { Injectable, NotFoundException } from '@nestjs/common';
import { Link, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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

  async create(data: Prisma.LinkCreateInput): Promise<Link | null> {
    try {
      return await this.prisma.link.create({ data });
    } catch (error) {
      throw new Error('Error creating link');
    }
  }

  async update(
    id: Link['id'],
    data: Prisma.LinkUpdateInput,
  ): Promise<Link | null> {
    try {
      return await this.prisma.link.update({ where: { id }, data });
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
