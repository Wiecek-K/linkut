import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { JwtUserPayload } from 'src/types/JwtUserPayload';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, plainPassword: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user) {
      const isMatch = await argon2.verify(user.password, plainPassword);
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    }

    return null;
  }

  async login(user: any) {
    const payload: JwtUserPayload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
