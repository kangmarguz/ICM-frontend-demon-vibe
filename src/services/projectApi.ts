import { apiClient } from '../lib/apiClient';
import type { ImageType, Project, ProjectImage, ProjectStatus } from '../types/project';

export type CreateProjectRequest = {
  title: string;
  description?: string;
  urlLink?: string;
  siteId?: string;
  assignedUserId?: string;
  status: ProjectStatus;
  isActive: boolean;
  images: Array<{
    name: string;
    url: string;
    publicId?: string | null;
    type: ImageType;
  }>;
};

export type UpdateProjectRequest = {
  title: string;
  description?: string;
  urlLink?: string;
  siteId?: string | null;
  assignedUserId?: string;
  status?: ProjectStatus;
  isActive?: boolean;
  images?: Array<{
    name: string;
    url: string;
    publicId?: string | null;
    type: ImageType;
  }>;
};

type CreateProjectApiResponse = Project | {
  data?: Project | { project?: Project };
  project?: Project;
};

type ProjectDetailApiResponse = unknown;

type ProjectApiResponse = Project & {
  createdBy?: unknown;
  image2D?: ProjectImage[];
  image3D?: ProjectImage[];
  paySlip?: ProjectImage | ProjectImage[] | null;
};

type GetProjectsApiResponse = unknown;

function normalizeCreateProjectResponse(response: CreateProjectApiResponse) {
  if ('id' in response) {
    return normalizeProject(response as ProjectApiResponse);
  }

  if (response.project) {
    return normalizeProject(response.project as ProjectApiResponse);
  }

  if (response.data && 'id' in response.data) {
    return normalizeProject(response.data as ProjectApiResponse);
  }

  return normalizeProject(response.data?.project as ProjectApiResponse);
}

function normalizeProjectResponse(response: ProjectDetailApiResponse) {
  const payload = asRecord(response);
  const data = asRecord(payload.data);
  const project = payload.project ?? payload.data ?? data.project ?? response;

  return normalizeProject(project as ProjectApiResponse);
}

function normalizeProjectsResponse(response: GetProjectsApiResponse) {
  const payload = asRecord(response);
  const data = asRecord(payload.data);
  const candidates = [response, payload.projects, payload.data, data.projects];
  const projects = candidates.find((candidate) => Array.isArray(candidate));

  if (!Array.isArray(projects)) {
    return [];
  }

  return projects.map((project) => normalizeProject(project as ProjectApiResponse));
}

export async function createProject(payload: CreateProjectRequest) {
  const response = await apiClient.post<CreateProjectApiResponse>('/projects', payload);
  return normalizeCreateProjectResponse(response.data);
}

export async function getProjectById(projectId: string) {
  const response = await apiClient.get<ProjectDetailApiResponse>(`/projects/${projectId}`);
  return normalizeProjectResponse(response.data);
}

export async function updateProject(projectId: string, payload: UpdateProjectRequest) {
  const response = await apiClient.patch<ProjectDetailApiResponse>(`/projects/${projectId}`, payload);
  return normalizeProjectResponse(response.data);
}

export async function getProjects() {
  const response = await apiClient.get<GetProjectsApiResponse>('/projects');
  return normalizeProjectsResponse(response.data);
}

export async function getProjectsByUserId(userId: string) {
  const response = await apiClient.get<GetProjectsApiResponse>(`/users/${userId}/projects`);
  return normalizeProjectsResponse(response.data);
}

function normalizeProject(project: ProjectApiResponse): Project {
  const createdBy = asRecord(project.createdBy);

  return {
    ...project,
    createdById: project.createdById ?? getOptionalString(createdBy, 'id') ?? null,
    description: project.description ?? null,
    urlLink: project.urlLink ?? null,
    images: normalizeProjectImages(project),
  };
}

function normalizeProjectImages(project: ProjectApiResponse) {
  const directImages = Array.isArray(project.images) ? project.images : [];
  const image2D = normalizeImagesByType(project.image2D, 'IMAGE_2D');
  const image3D = normalizeImagesByType(project.image3D, 'IMAGE_3D');
  const paySlip = normalizeImagesByType(project.paySlip, 'PAY_SLIP');

  return [...directImages, ...image2D, ...image3D, ...paySlip];
}

function normalizeImagesByType(images: ProjectImage | ProjectImage[] | null | undefined, type: ImageType) {
  const list = Array.isArray(images) ? images : images ? [images] : [];

  return list.map((image) => ({
    ...image,
    type,
  }));
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function getOptionalString(record: Record<string, unknown>, key: string) {
  const value = record[key];

  if (typeof value === 'string') {
    return value;
  }

  return undefined;
}
