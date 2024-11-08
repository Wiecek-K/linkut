import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findUnique(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async findAll(params: { minLinks?: number }): Promise<User[] | null> {
    const { minLinks } = params;

    if (minLinks !== undefined) {
      const users = await this.prisma.user.findMany({
        where: {
          links: {
            some: {},
          },
        },
        include: {
          links: {
            select: {
              id: true, // We are selecting only id to limit the amount of data.
            },
          },
        },
      });

      const filteredUsers = users.filter(
        (user) => user.links.length >= minLinks,
      );

      return filteredUsers;
    }

    return await this.prisma.user.findMany();
  }

  async create(data: Prisma.UserCreateInput): Promise<User | null> {
    return this.prisma.user.create({ data });
  }

  async update(
    id: User['id'],
    data: Prisma.UserUpdateInput,
  ): Promise<User | null> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: User['id']): Promise<User | null> {
    return this.prisma.user.delete({ where: { id } });
  }
}
