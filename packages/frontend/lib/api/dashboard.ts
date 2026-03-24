import { apiClient } from './client';
import type { ActionResponse } from '@/types';

// ---- Types ----

export type DashboardStats = {
  products: number;
  hiddenProducts: number;
  categories: number;
  users: number;
};

export type DashboardData = {
  stats: DashboardStats;
  fullName: string;
};

// ---- API Functions ----

export async function getDashboardStats(): Promise<ActionResponse<DashboardData>> {
  return apiClient.get<ActionResponse<DashboardData>>('/dashboard/stats');
}
