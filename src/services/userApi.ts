import { apiClient } from '../lib/apiClient';
import type { AppUser, Role } from '../types/auth';

export type CreateUserRequest = {
  name: string;
  email: string;
  role: Role;
  siteId?: string;
};

type UsersResponse =
  | AppUser[]
  | {
      users?: AppUser[];
      data?: AppUser[] | { users?: AppUser[] };
    };

type UserResponse =
  | AppUser
  | {
      user?: AppUser;
      defaultPassword?: string;
      data?: AppUser | { user?: AppUser; defaultPassword?: string };
    };

function normalizeUsersResponse(response: UsersResponse) {
  if (Array.isArray(response)) {
    return response;
  }

  if (response.users) {
    return response.users;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data?.users ?? [];
}

function normalizeUserResponse(response: UserResponse) {
  if ('id' in response) {
    return {
      user: response,
      defaultPassword: undefined,
    };
  }

  if (response.user) {
    return {
      user: response.user,
      defaultPassword: response.defaultPassword,
    };
  }

  if (response.data && 'id' in response.data) {
    return {
      user: response.data,
      defaultPassword: undefined,
    };
  }

  return {
    user: response.data?.user,
    defaultPassword: response.data?.defaultPassword,
  };
}

export async function fetchUsers() {
  const response = await apiClient.get<UsersResponse>('/users');
  return normalizeUsersResponse(response.data);
}

export async function createUser(payload: CreateUserRequest) {
  const response = await apiClient.post<UserResponse>('/users', payload);
  return normalizeUserResponse(response.data);
}

export async function updateUserActive(userId: string, isActive: boolean) {
  const response = await apiClient.patch<UserResponse>(`/users/${userId}/active`, { isActive });
  return normalizeUserResponse(response.data).user;
}

export async function updateUserSite(userId: string, siteId?: string | null) {
  const response = await apiClient.patch<UserResponse>(`/users/${userId}/site`, { siteId });
  return normalizeUserResponse(response.data).user;
}

export async function resetUserPassword(userId: string) {
  const response = await apiClient.patch<UserResponse>(`/users/${userId}/reset-password`);
  return normalizeUserResponse(response.data).user;
}
