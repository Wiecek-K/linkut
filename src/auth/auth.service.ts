import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, plainPassword: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    if (user) {
      const isMatch = await bcrypt.compare(plainPassword, user.password);
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    }

    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
