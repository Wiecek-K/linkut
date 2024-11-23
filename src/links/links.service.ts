import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Link } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateLinkDto } from './dto/update-link.dto';
import { nanoid } from 'nanoid';
import { CreateLinkDto } from './dto/create-link.dto';

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

  async create(
    createLinkDto: CreateLinkDto,
    userId: string,
  ): Promise<Link | null> {
    const SHORTCODE_LENGTH = 6;
    const MAX_ATTEMPTS = 5;

    const { originalUrl } = createLinkDto;

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }

      let shortUrl: string;
      let attempts = 0;

      do {
        shortUrl = nanoid(SHORTCODE_LENGTH);

        const exists = await this.prisma.link.findFirst({
          where: { shortUrl },
        });

        if (!exists) {
          const newLink = await this.prisma.link.create({
            data: {
              originalUrl,
              shortUrl,
              userId,
            },
          });

          return newLink; //TODO:
        }

        attempts++;
      } while (attempts < MAX_ATTEMPTS);
      //
      throw new ConflictException('Could not generate unique shortcode');
      //
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
