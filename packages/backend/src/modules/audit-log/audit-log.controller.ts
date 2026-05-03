import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('audit-logs')
export class AuditLogController {
  constructor(private auditLogService: AuditLogService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.auditLogService.getLogs(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
    return {
      success: true,
      message: 'История изменений получена',
      data: result,
    };
  }
}
