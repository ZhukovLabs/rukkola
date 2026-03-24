import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import { User } from '../../schemas/user.schema';
import { Session } from '../../schemas/session.schema';

interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  sessionToken: string;
  iat?: number;
  exp?: number;
}

// Extract from cookie first, then fall back to Authorization header
const extractJwtFromCookieOrHeader = (req: Request): string | null => {
  if (req?.cookies?.access_token) {
    return req.cookies.access_token;
  }
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET must be set');
    }
    super({
      jwtFromRequest: extractJwtFromCookieOrHeader,
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const { sub: userId, role, sessionToken } = payload;

    // Verify session exists and not expired
    const session = await this.sessionModel
      .findOne({ token: sessionToken })
      .select('expiresAt')
      .lean<{ expiresAt: Date }>()
      .exec();

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await this.sessionModel.deleteOne({ token: sessionToken }).catch(() => {});
      }
      throw new UnauthorizedException('Session expired');
    }

    // Verify user is active and role matches
    const user = await this.userModel
      .findById(userId)
      .select('role isActive username name')
      .lean<{ _id: { toString(): string }; role: string; isActive: boolean; username: string; name: string }>()
      .exec();

    if (!user || !user.isActive || user.role !== role) {
      await this.sessionModel.deleteOne({ token: sessionToken }).catch(() => {});
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      role: user.role,
      sessionToken,
    };
  }
}
