import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CaptchaService {
  private readonly hcaptchaSecret: string | undefined;
  private readonly HCAPTCHA_VERIFY_URL = 'https://api.hcaptcha.com/siteverify';

  constructor(private configService: ConfigService) {
    this.hcaptchaSecret = this.configService.get<string>('HCAPTCHA_SECRET_KEY');
  }

  async verifyCaptcha(
    token: string | undefined,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.hcaptchaSecret) {
      console.warn('HCAPTCHA_SECRET_KEY not configured — CAPTCHA verification skipped');
      return { success: true };
    }

    if (!token) {
      return { success: false, error: 'CAPTCHA не пройдена' };
    }

    try {
      const response = await fetch(this.HCAPTCHA_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${encodeURIComponent(this.hcaptchaSecret)}&response=${encodeURIComponent(token)}`,
      });

      const data = await response.json();

      if (!data.success) {
        return { success: false, error: 'CAPTCHA не пройдена' };
      }

      return { success: true };
    } catch (error) {
      console.error('CAPTCHA verification error:', error);
      return { success: false, error: 'Ошибка проверки CAPTCHA' };
    }
  }
}
