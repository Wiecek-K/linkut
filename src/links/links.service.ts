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
import { UrlService } from 'src/url/url.service';

@Injectable()
export class LinksService {
  constructor(
    private prisma: PrismaService,
    private readonly urlService: UrlService,
  ) {}

  async findOne(id: Link['id']): Promise<Link | null> {
    try {
      return await this.prisma.link.findUnique({
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

  async findOrginalUrl(
    shortUrlCode: Link['shortUrlCode'],
  ): Promise<string | null> {
    try {
      const link = await this.prisma.link.findUnique({
        where: { shortUrlCode },
      });
      return link.originalUrl;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(
          `Link with shortUrlCode "${shortUrlCode}" not found.`,
        );
      } else {
        throw new Error(
          `Error fetching link with shortUrlCode "${shortUrlCode}"`,
        );
      }
    }
  }

  async findLinksByUser(
    userId: string,
  ): Promise<{ shortUrl: string; originalUrl: string }[] | null> {
    try {
      const links = await this.prisma.link.findMany({
        where: { userId },
      });

      return links.map(({ originalUrl, shortUrlCode }) => {
        return {
          shortUrl: this.urlService.getFullUrl(
            `${process.env.CONVERT_SHORT_TO_ORGINAL_URL_ENDPOINT}/${shortUrlCode}`,
          ),
          originalUrl,
        };
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(
          `No links were found belonging to the user with ID ${userId}`,
        );
      } else {
        throw new Error(
          `Error fetching links belonging to the user with ID "${userId}"`,
        );
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

      let shortUrlCode: string;
      let attempts = 0;

      do {
        shortUrlCode = nanoid(SHORTCODE_LENGTH);

        const exists = await this.prisma.link.findFirst({
          where: { shortUrlCode },
        });

        if (!exists) {
          const newLink = await this.prisma.link.create({
            data: {
              originalUrl,
              shortUrlCode,
              userId,
            },
          });

          return newLink;
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
