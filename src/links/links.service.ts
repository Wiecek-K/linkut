import { Injectable } from '@nestjs/common';
import { Link, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LinksService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: Link['id']): Promise<Link | null> {
    return this.prisma.link.findFirst({
      where: { id },
    });
  }

  async findAll(): Promise<Link[] | null> {
    return await this.prisma.link.findMany();
  }

  async create(data: Prisma.LinkCreateInput): Promise<Link | null> {
    return this.prisma.link.create({ data });
  }

  async update(
    id: Link['id'],
    data: Prisma.LinkUpdateInput,
  ): Promise<Link | null> {
    return this.prisma.link.update({ where: { id }, data });
  }

  async delete(id: Link['id']): Promise<Link | null> {
    return this.prisma.link.delete({ where: { id } });
  }
}
