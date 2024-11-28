import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Link, LinkStatistic } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateLinkDto } from './dto/update-link.dto';
import { nanoid } from 'nanoid';
import { CreateLinkDto } from './dto/create-link.dto';
import { getFullUrl } from 'src/utils/getFullUrl';
import { Request } from 'express';

@Injectable()
export class LinksService {
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(LinksService.name);

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

  async menageShortLinkClick(
    shortUrlCode: Link['shortUrlCode'],
    ref = '',
  ): Promise<string | null> {
    try {
      const referrer = ref.toLocaleLowerCase();
      const link = await this.prisma.link.findUnique({
        where: { shortUrlCode },
        include: { linkStatistics: true },
      });

      const existingStatistic = link.linkStatistics.find(
        (stat) => stat.referrer === referrer,
      );

      if (existingStatistic) {
        await this.prisma.linkStatistic.update({
          where: { id: existingStatistic.id },
          data: {
            clicks: { increment: 1 },
          },
        });
      } else {
        await this.prisma.linkStatistic.create({
          data: {
            referrer: ref,
            clicks: 1,
            link: {
              connect: { id: link.id },
            },
          },
        });
      }

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
    request: Request,
  ): Promise<{ shortUrl: string; originalUrl: string }[] | null> {
    try {
      const links = await this.prisma.link.findMany({
        where: { userId },
      });

      const protocol = request.protocol;
      const host = request.get('host');

      return links.map(({ originalUrl, shortUrlCode }) => {
        return {
          shortUrl: getFullUrl(
            protocol,
            host,
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

  async deleteExpired() {
    try {
      const now = new Date();
      const hours48Ago = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      return await this.prisma.link.deleteMany({
        where: { createdAt: { lt: hours48Ago } },
      });
    } catch (error) {
      throw new Error(`Error deleting links"`);
    }
  }

  async findLinkStatistics(
    shortUrlCode: Link['shortUrlCode'],
    userId: string,
  ): Promise<LinkStatistic[] | null> {
    const link = await this.prisma.link.findFirst({
      where: { shortUrlCode, userId },
      include: { linkStatistics: true },
    });
    this.logger.log(link);

    if (!link) {
      throw new NotFoundException(
        `Link with shortUrlCode "${shortUrlCode}" not found.`,
      );
    }

    return link.linkStatistics;
  }
}
