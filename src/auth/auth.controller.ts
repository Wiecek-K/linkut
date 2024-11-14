import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Public } from './auth.decorator';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req: Request, @Res() res: Response) {
    const { access_token } = await this.authService.login(req.user);

    res.cookie('jwt', access_token, {
      httpOnly: true,
    });

    return res.send({ message: `Login successful` });
  }
}
