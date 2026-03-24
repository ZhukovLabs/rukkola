import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setTokens(res: Response, accessToken: string, refreshToken: string) {
    const corsOrigin = process.env.CORS_ORIGIN || '';
    const isLocalhost = corsOrigin.includes('localhost') || corsOrigin.includes('127.0.0.1');
    const isProduction = process.env.NODE_ENV === 'production' || (!isLocalhost && corsOrigin.includes('.'));
    
    // Use 'none' for cross-site (different domains), 'lax' for localhost
    const sameSite = isProduction ? 'none' : 'lax';
    const secure = isProduction;
    
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: 5 * 60 * 1000,
      path: '/',
    });

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
  }

  private clearTokens(res: Response) {
    res.cookie(ACCESS_TOKEN_COOKIE, '', { maxAge: 0, path: '/' });
    res.cookie(REFRESH_TOKEN_COOKIE, '', { maxAge: 0, path: '/' });
  }

  private getRefreshToken(req: Request): string | undefined {
    return req.cookies?.[REFRESH_TOKEN_COOKIE];
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request, @Res() res: Response) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      (req.headers['x-real-ip'] as string) ??
      req.ip ??
      'unknown';
    const userAgent = req.headers['user-agent'] ?? 'unknown';

    const result = await this.authService.login(loginDto, ip, userAgent);

    this.setTokens(res, result.accessToken, result.refreshToken);

    return res.json({
      success: true,
      message: 'Авторизация успешна',
      data: {
        user: result.user,
      },
    });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = this.getRefreshToken(req);
    
    if (!refreshToken) {
      throw new UnauthorizedException('Токен обновления не найден');
    }

    const tokens = await this.authService.refresh(refreshToken);

    this.setTokens(res, tokens.accessToken, tokens.refreshToken);

    return res.json({
      success: true,
      message: 'Токены обновлены',
    });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = this.getRefreshToken(req);
    
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    this.clearTokens(res);

    return res.json({
      success: true,
      message: 'Выход выполнен',
    });
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
