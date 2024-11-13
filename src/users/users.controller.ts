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
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get() //   GET /users or /users?min-links=value
  async getAllUsers(@Query('minLinks') minLinks?: number) {
    try {
      return await this.usersService.findAll({ minLinks });
    } catch (error) {
      throw new HttpException(
        'Error fetching users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id') //  GET /users/:id
  async getUserById(@Param('id') id: string) {
    try {
      return await this.usersService.findUnique({ id });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          'Error fetching user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Post() //POST  /users
  async createUser(@Body() userDto: User) {
    try {
      return await this.usersService.create(userDto);
    } catch (error) {
      throw new HttpException(
        'Error creating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id') //  PATCH /users/:id
  async updateUser(@Param('id') id: string, @Body() userDto: User) {
    try {
      return await this.usersService.update(id, userDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          'Error fetching user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Delete(':id') //  DELETE /users/:id
  async deleteUser(@Param('id') id: string) {
    try {
      return await this.usersService.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          'Error fetching user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
