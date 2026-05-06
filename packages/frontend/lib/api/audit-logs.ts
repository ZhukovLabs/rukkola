import { AuditLogListResponse, ApiResponse } from '@rukkola/shared';
import { apiClient } from './client';

export interface AuditLogParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  userId?: string;
  entityType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const auditLogsApi = {
  getLogs: (params: AuditLogParams = {}) => {
    const { page = 1, limit = 20, sortBy, sortOrder, userId, entityType, dateFrom, dateTo } = params;
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(page));
    searchParams.set('limit', String(limit));
    if (sortBy) searchParams.set('sortBy', sortBy);
    if (sortOrder) searchParams.set('sortOrder', sortOrder);
    if (userId) searchParams.set('userId', userId);
    if (entityType) searchParams.set('entityType', entityType);
    if (dateFrom) searchParams.set('dateFrom', dateFrom);
    if (dateTo) searchParams.set('dateTo', dateTo);
    return apiClient.get<ApiResponse<AuditLogListResponse>>(`/audit-logs?${searchParams.toString()}`);
  },
};
