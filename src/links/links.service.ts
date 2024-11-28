import {
  ConflictException,
  Injectable,
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

  async findOne(id: Link['id']): Promise<Link | null> {
    const link = await this.prisma.link.findUnique({
      where: { id },
    });

    if (!link) {
      throw new NotFoundException(`Link with ID "${id}" not found.`);
    }

    return link;
  }

  async manageShortLinkClick(
    shortUrlCode: Link['shortUrlCode'],
    ref = '',
  ): Promise<string | null> {
    const link = await this.prisma.link.findUnique({
      where: { shortUrlCode },
      include: { linkStatistics: true },
    });

    if (!link) {
      throw new NotFoundException(
        `Link with shortUrlCode "${shortUrlCode}" not found.`,
      );
    }

    const referrer = ref.toLocaleLowerCase();
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
  }

  async findOrginalUrl(
    shortUrlCode: Link['shortUrlCode'],
  ): Promise<string | null> {
    const link = await this.prisma.link.findUnique({
      where: { shortUrlCode },
    });

    if (!link) {
      throw new NotFoundException(
        `Link with shortUrlCode "${shortUrlCode}" not found.`,
      );
    }

    return link.originalUrl;
  }

  async findLinksByUser(
    userId: string,
    request: Request,
  ): Promise<{ shortUrl: string; originalUrl: string }[] | null> {
    const links = await this.prisma.link.findMany({
      where: { userId },
    });

    if (links.length === 0) {
      throw new NotFoundException(
        `No links were found belonging to the user with ID ${userId}`,
      );
    }

    const protocol = request.protocol;
    const host = request.get('host');

    return links.map(({ originalUrl, shortUrlCode }) => ({
      shortUrl: getFullUrl(
        protocol,
        host,
        `${process.env.CONVERT_SHORT_TO_ORGINAL_URL_ENDPOINT}/${shortUrlCode}`,
      ),
      originalUrl,
    }));
  }

  async findAll(): Promise<Link[] | null> {
    return this.prisma.link.findMany();
  }

  async create(
    createLinkDto: CreateLinkDto,
    userId: string,
  ): Promise<Link | null> {
    const SHORTCODE_LENGTH = 6;
    const MAX_ATTEMPTS = 5;

    const { originalUrl } = createLinkDto;

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

    throw new ConflictException('Could not generate unique shortcode');
  }

  async update(
    id: Link['id'],
    updateLinkDto: UpdateLinkDto,
  ): Promise<Link | null> {
    const existingLink = await this.prisma.link.findUnique({
      where: { id },
    });

    if (!existingLink) {
      throw new NotFoundException(`Link with ID "${id}" not found.`);
    }

    return this.prisma.link.update({
      where: { id },
      data: updateLinkDto,
    });
  }

  async delete(id: Link['id']): Promise<Link | null> {
    const existingLink = await this.prisma.link.findUnique({
      where: { id },
    });

    if (!existingLink) {
      throw new NotFoundException(`Link with ID "${id}" not found.`);
    }

    return this.prisma.link.delete({ where: { id } });
  }

  async deleteExpired() {
    const now = new Date();
    const hours48Ago = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    return this.prisma.link.deleteMany({
      where: { createdAt: { lt: hours48Ago } },
    });
  }

  async findLinkStatistics(
    shortUrlCode: Link['shortUrlCode'],
    userId: string,
  ): Promise<LinkStatistic[] | null> {
    const link = await this.prisma.link.findFirst({
      where: { shortUrlCode, userId },
      include: { linkStatistics: true },
    });

    if (!link) {
      throw new NotFoundException(
        `Link with shortUrlCode "${shortUrlCode}" not found.`,
      );
    }

    return link.linkStatistics;
  }
}
