import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { User } from '../../schemas/user.schema';
import { Session } from '../../schemas/session.schema';
import { RateLimitService } from './rate-limit.service';
import { CaptchaService } from './captcha.service';
import { LoginDto } from './dto/login.dto';

const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    private jwtService: JwtService,
    private rateLimitService: RateLimitService,
    private captchaService: CaptchaService,
  ) {}

  private generateTokens(user: any, sessionToken: string, refreshToken: string) {
    const accessToken = this.jwtService.sign({
      sub: user._id.toString(),
      username: user.username,
      role: user.role,
      sessionToken,
    });

    const refreshTokenPayload = {
      sub: user._id.toString(),
      sessionToken,
      refreshToken,
    };
    const refreshTokenSigned = this.jwtService.sign(refreshTokenPayload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken: refreshTokenSigned };
  }

  async login(
    loginDto: LoginDto,
    ip: string,
    userAgent: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; username: string; name: string; role: string };
  }> {
    // Rate limit check
    const rateLimitResult = this.rateLimitService.checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      const remainingMinutes = rateLimitResult.blockedUntil
        ? Math.ceil((rateLimitResult.blockedUntil - Date.now()) / 60000)
        : 30;
      throw new UnauthorizedException(
        `Слишком много попыток входа. Попробуйте через ${remainingMinutes} мин.`,
      );
    }

    // CAPTCHA verification
    const captchaResult = await this.captchaService.verifyCaptcha(loginDto.captchaToken);
    if (!captchaResult.success) {
      throw new UnauthorizedException(captchaResult.error || 'CAPTCHA не пройдена');
    }

    // Find user
    const user = await this.userModel
      .findOne({ username: loginDto.username.toLowerCase() })
      .select('+password')
      .exec();

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    // Check account lock
    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new UnauthorizedException('Слишком много попыток входа. Попробуйте позже.');
    }

    // Validate password
    const isValid = await user.comparePassword(loginDto.password);
    if (!isValid) {
      user.failedLoginAttempts = (user.failedLoginAttempts ?? 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 5 * 60 * 1000);
        user.failedLoginAttempts = 0;
      }
      await user.save();
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    // Reset failed attempts
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // Create session with both tokens
    const sessionToken = uuidv4();
    const refreshToken = crypto.randomBytes(64).toString('hex');

    await this.sessionModel.create({
      userId: user._id,
      token: sessionToken,
      refreshToken,
      ip,
      userAgent,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
    });

    // Generate tokens
    const { accessToken, refreshToken: signedRefreshToken } = this.generateTokens(
      user,
      sessionToken,
      refreshToken,
    );

    return {
      accessToken,
      refreshToken: signedRefreshToken,
      user: {
        id: user._id.toString(),
        username: user.username,
        name: user.name || user.username,
        role: user.role,
      },
    };
  }

  async refresh(refreshTokenSigned: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Verify refresh token
    let decoded: any;
    try {
      decoded = this.jwtService.verify(refreshTokenSigned);
    } catch {
      throw new UnauthorizedException('Недействительный токен');
    }

    // Find session with the refresh token
    const session = await this.sessionModel.findOne({
      token: decoded.sessionToken,
      refreshToken: decoded.refreshToken,
    });

    if (!session) {
      throw new UnauthorizedException('Сессия не найдена');
    }

    if (session.expiresAt < new Date()) {
      await this.sessionModel.deleteOne({ _id: session._id });
      throw new UnauthorizedException('Сессия истекла');
    }

    // Get user
    const user = await this.userModel.findById(session.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    // Generate new tokens (rotate refresh token)
    const newSessionToken = uuidv4();
    const newRefreshToken = crypto.randomBytes(64).toString('hex');

    // Update session
    await this.sessionModel.updateOne(
      { _id: session._id },
      {
        token: newSessionToken,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
      },
    );

    return this.generateTokens(user, newSessionToken, newRefreshToken);
  }

  async logout(refreshTokenSigned: string): Promise<void> {
    try {
      const decoded = this.jwtService.verify(refreshTokenSigned);
      await this.sessionModel.deleteOne({ token: decoded.sessionToken });
    } catch {
      // Token invalid, nothing to logout
    }
  }

  async getMe(userId: string): Promise<{
    id: string;
    username: string;
    name: string;
    surname?: string;
    patronymic?: string;
    role: string;
  }> {
    const user = await this.userModel
      .findById(userId)
      .select('username name surname patronymic role')
      .lean<{
        _id: { toString(): string };
        username: string;
        name: string;
        surname?: string;
        patronymic?: string;
        role: string;
      }>()
      .exec();

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      surname: user.surname,
      patronymic: user.patronymic,
      role: user.role,
    };
  }
}
