import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../schemas/user.schema';
import { Session } from '../../schemas/session.schema';
import { RateLimitService } from './rate-limit.service';
import { CaptchaService } from './captcha.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    private jwtService: JwtService,
    private rateLimitService: RateLimitService,
    private captchaService: CaptchaService,
  ) {}

  async login(
    loginDto: LoginDto,
    ip: string,
    userAgent: string,
  ): Promise<{
    accessToken: string;
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

    // Create session
    const sessionToken = uuidv4();
    await this.sessionModel.create({
      userId: user._id,
      token: sessionToken,
      ip,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Generate JWT
    const jwtPayload = {
      sub: user._id.toString(),
      username: user.username,
      role: user.role,
      sessionToken,
    };

    const accessToken = this.jwtService.sign(jwtPayload);

    return {
      accessToken,
      user: {
        id: user._id.toString(),
        username: user.username,
        name: user.name || user.username,
        role: user.role,
      },
    };
  }

  async logout(sessionToken: string): Promise<void> {
    await this.sessionModel.deleteOne({ token: sessionToken });
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
