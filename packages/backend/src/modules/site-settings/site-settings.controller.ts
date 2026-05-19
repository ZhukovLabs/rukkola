import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('site-settings')
export class SiteSettingsController {
  constructor(private siteSettingsService: SiteSettingsService) {}

  @Get()
  async getSettings() {
    const data = await this.siteSettingsService.getSettings();
    return {
      success: true,
      message: 'OK',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch()
  async updateSettings(
    @Body()
    body: {
      address?: string;
      addressLink?: string;
      addressNote?: string;
      phone?: string;
      phoneLink?: string;
      workHours?: string;
      workHoursNote?: string;
    },
    @CurrentUser() user: { id: string },
  ) {
    const data = await this.siteSettingsService.updateSettings(body, user.id);
    return {
      success: true,
      message: 'Контакты обновлены',
      data,
    };
  }
}
