import { apiClient } from './client';
import type { ActionResponse } from '@/types';

// ---- Types ----

export type SerializedUser = {
  _id: string;
  username: string;
  name: string;
  surname?: string;
  patronymic?: string;
  role: string;
};

export type CreateUserInput = {
  username: string;
  password: string;
  name: string;
  surname?: string;
  patronymic?: string;
  role?: string;
};

export type UpdateUserInput = Partial<{
  username: string;
  name: string;
  surname?: string;
  patronymic?: string;
  role: string;
}>;

// ---- API Functions ----

export async function getUsers(): Promise<ActionResponse<SerializedUser[]>> {
  return apiClient.get<ActionResponse<SerializedUser[]>>('/users');
}

export async function createUser(
  data: CreateUserInput,
): Promise<ActionResponse<SerializedUser>> {
  return apiClient.post<ActionResponse<SerializedUser>>('/users', data);
}

export async function updateUser(
  id: string,
  data: UpdateUserInput,
): Promise<ActionResponse<SerializedUser>> {
  return apiClient.patch<ActionResponse<SerializedUser>>(`/users/${id}`, data);
}

export async function deleteUser(
  id: string,
): Promise<ActionResponse<SerializedUser>> {
  return apiClient.delete<ActionResponse<SerializedUser>>(`/users/${id}`);
}

export async function updatePassword(
  userId: string,
  oldPassword: string,
  newPassword: string,
): Promise<ActionResponse> {
  return apiClient.patch<ActionResponse>(`/users/${userId}/password`, {
    oldPassword,
    newPassword,
  });
}
