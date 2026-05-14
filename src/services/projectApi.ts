import { apiClient } from '../lib/apiClient';
import type { ImageType, Project, ProjectStatus } from '../types/project';

export type CreateProjectRequest = {
  title: string;
  description?: string;
  status: ProjectStatus;
  isActive: boolean;
  images: Array<{
    name: string;
    url: string;
    publicId?: string | null;
    type: ImageType;
  }>;
};

type CreateProjectApiResponse = Project | {
  data: Project;
};

function normalizeCreateProjectResponse(response: CreateProjectApiResponse) {
  if ('data' in response) {
    return response.data;
  }

  return response;
}

export async function createProject(payload: CreateProjectRequest) {
  const response = await apiClient.post<CreateProjectApiResponse>('/projects', payload);
  return normalizeCreateProjectResponse(response.data);
}
