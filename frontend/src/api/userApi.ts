import { apiClient } from '../auth/apiClient';

export interface UserProfile {
  userId: string;
  email: string;
  name: string | null;
  createdAtUtc: string;
}

export async function fetchProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get<UserProfile>('/me');
  return data;
}

export async function updateName(name: string): Promise<void> {
  await apiClient.patch('/me/name', { name });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await apiClient.patch('/me/password', { currentPassword, newPassword });
}
