import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      (req.headers['x-real-ip'] as string) ??
      req.ip ??
      'unknown';
    const userAgent = req.headers['user-agent'] ?? 'unknown';

    const result = await this.authService.login(loginDto, ip, userAgent);

    return {
      success: true,
      message: 'Авторизация успешна',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: { sessionToken: string }) {
    await this.authService.logout(user.sessionToken);
    return {
      success: true,
      message: 'Выход выполнен',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: { id: string }) {
    const userData = await this.authService.getMe(user.id);
    return {
      success: true,
      message: 'OK',
      data: userData,
    };
  }
}
