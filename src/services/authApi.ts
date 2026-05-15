import { apiClient } from '../lib/apiClient';
import type { AppUser } from '../types/auth';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message?: string;
  token: string;
  user: AppUser;
};

type LoginApiResponse = LoginResponse | {
  data: LoginResponse;
};

export type UpdateUserRequest = {
  name: string;
  oldPassword?: string;
  newPassword?: string;
};

export type UpdateAvatarRequest = {
  name: string;
  file: string;
};

type UpdateUserApiResponse =
  | AppUser
  | {
      user?: AppUser;
      data?: AppUser | { user?: AppUser };
    };

function normalizeLoginResponse(response: LoginApiResponse) {
  if ('data' in response) {
    return response.data;
  }

  return response;
}

export async function login(payload: LoginRequest) {
  const response = await apiClient.post<LoginApiResponse>('/login', payload);
  return normalizeLoginResponse(response.data);
}

function normalizeUpdateUserResponse(response: UpdateUserApiResponse, fallbackUser: AppUser) {
  if ('id' in response) {
    return response;
  }

  if (response.user) {
    return response.user;
  }

  if (response.data && 'id' in response.data) {
    return response.data;
  }

  if (response.data?.user) {
    return response.data.user;
  }

  return fallbackUser;
}

export async function updateUser(userId: string, payload: UpdateUserRequest, currentUser: AppUser) {
  const response = await apiClient.patch<UpdateUserApiResponse>(`/users/${userId}`, payload);
  return normalizeUpdateUserResponse(response.data, {
    ...currentUser,
    name: payload.name,
    forceResetPassword: payload.newPassword ? false : currentUser.forceResetPassword,
  });
}

export async function updateUserAvatar(userId: string, payload: UpdateAvatarRequest, currentUser: AppUser) {
  const response = await apiClient.patch<UpdateUserApiResponse>(`/users/${userId}/avatar`, payload);
  return normalizeUpdateUserResponse(response.data, currentUser);
}

export async function deleteUserAvatar(userId: string, currentUser: AppUser) {
  const response = await apiClient.delete<UpdateUserApiResponse>(`/users/${userId}/avatar`);
  return normalizeUpdateUserResponse(response.data, {
    ...currentUser,
    avatarUrl: null,
    avatarPublicId: null,
  });
}
