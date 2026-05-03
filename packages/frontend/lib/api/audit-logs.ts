import { AuditLogListResponse, ApiResponse } from '@rukkola/shared';
import { apiClient } from './client';

export const auditLogsApi = {
  getLogs: (page = 1, limit = 20) =>
    apiClient.get<ApiResponse<AuditLogListResponse>>(`/audit-logs?page=${page}&limit=${limit}`),
};
