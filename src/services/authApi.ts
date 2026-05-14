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
