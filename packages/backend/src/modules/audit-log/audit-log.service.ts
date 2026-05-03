import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from '../../schemas/audit-log.schema';
import { AuditLogDto, AuditLogListResponse } from '@rukkola/shared';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
  ) {}

  async createLog(userId: string, action: string, details: string): Promise<void> {
    const MAX_LOGS = 500;

    await this.auditLogModel.create({
      user: userId,
      action,
      details,
    });

    const count = await this.auditLogModel.countDocuments();
    if (count > MAX_LOGS) {
      const oldestLogs = await this.auditLogModel
        .find()
        .sort({ createdAt: 1 })
        .limit(count - MAX_LOGS)
        .exec();

      const oldestIds = oldestLogs.map((log) => log._id);
      await this.auditLogModel.deleteMany({ _id: { $in: oldestIds } });
    }
  }

  async getLogs(page = 1, limit = 20): Promise<AuditLogListResponse> {
    const skip = (page - 1) * limit;
    
    const [logs, total] = await Promise.all([
      this.auditLogModel
        .find()
        .populate('user', 'username name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.auditLogModel.countDocuments(),
    ]);

    const serializedLogs: AuditLogDto[] = logs.map((log: any) => ({
      id: log._id.toString(),
      user: {
        id: log.user?._id?.toString() || 'unknown',
        username: log.user?.username || 'unknown',
        name: log.user?.name || 'Система',
      },
      action: log.action,
      details: log.details,
      createdAt: log.createdAt.toISOString(),
    }));

    return {
      logs: serializedLogs,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
