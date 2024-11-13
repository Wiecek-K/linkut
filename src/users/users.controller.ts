import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get() //   GET /users or /users?min-links=value
  async getAllUsers(@Query('minLinks') minLinks?: number) {
    return await this.usersService.findAll({ minLinks });
  }

  @Get(':id') //  GET /users/:id
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findUnique({ id });

    if (!user) {
      throw new HttpException(
        'Nie znaleziono użytkownika',
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  @Post() //POST  /users
  async createUser(@Body() userDto: User) {
    return await this.usersService.create(userDto);
  }

  @Patch(':id') //  PATCH /users/:id
  async updateUser(@Param('id') id: string, @Body() userDto: User) {
    const updatedUser = await this.usersService.update(id, userDto);
    if (!updatedUser) {
      throw new HttpException(
        'Nie znaleziono użytkownika',
        HttpStatus.NOT_FOUND,
      );
    }
    return updatedUser;
  }

  @Delete(':id') //  DELETE /users/:id
  async deleteUser(@Param('id') id: string) {
    const deletedUser = await this.usersService.delete(id);
    if (!deletedUser) {
      throw new HttpException(
        'Nie znaleziono użytkownika',
        HttpStatus.NOT_FOUND,
      );
    }
    return deletedUser;
  }
}
