import { apiClient } from '../lib/apiClient';
import type { ImageType } from '../types/project';

export type UploadCloudinaryRequest = {
  name: string;
  file: string;
  type: ImageType;
};

export type UploadCloudinaryResponse = {
  name: string;
  url: string;
  publicId?: string | null;
};

type UploadApiResponse = {
  asset: UploadCloudinaryResponse;
};

export async function uploadToCloudinary(payload: UploadCloudinaryRequest) {
  const response = await apiClient.post<UploadApiResponse>('/uploads/cloudinary', payload);
  return response.data.asset;
}
