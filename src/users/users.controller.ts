import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  /*
    GET /user
    GET /user/:id
  */

  @Get() //   GET /users
  async getAllUsers() {
    return await this.usersService.findAll();
  }
}
