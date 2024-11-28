import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { encodePassword } from 'src/utils/bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findUnique(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
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
              id: true,
            },
          },
        },
      });

      return users.filter((user) => user.links.length >= minLinks);
    }

    return this.prisma.user.findMany();
  }

  async create(createUserDto: CreateUserDto): Promise<User | null> {
    const password = encodePassword(createUserDto.password);

    return this.prisma.user.create({
      data: { ...createUserDto, password },
    });
  }

  async update(
    id: User['id'],
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async delete(id: User['id']): Promise<User | null> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return this.prisma.user.delete({ where: { id } });
  }
}
