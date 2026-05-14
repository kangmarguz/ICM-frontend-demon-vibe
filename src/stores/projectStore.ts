import { create } from 'zustand';
import type { AppUser } from '../types/auth';
import type { Project, ProjectImage, ProjectStatus } from '../types/project';

type CreateProjectImageInput = {
  name: string;
  url: string;
  publicId?: string | null;
};

type CreateProjectInput = {
  title: string;
  description?: string;
  status: ProjectStatus;
  isActive: boolean;
  createdById: string;
  images: CreateProjectImageInput[];
};

type ProjectState = {
  projects: Project[];
  createProject: (input: CreateProjectInput) => void;
};

export function getVisibleProjects(projects: Project[], user: AppUser) {
  if (user.role === 'ADMIN') {
    return projects;
  }

  if (user.role === 'GUEST') {
    return projects.filter((project) => project.createdById === user.ownerId);
  }

  return projects.filter((project) => project.createdById === user.id);
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  createProject: (input) =>
    set((state) => {
      const now = new Date().toISOString();
      const projectId = crypto.randomUUID();
      const images: ProjectImage[] = input.images.map((image) => ({
        id: crypto.randomUUID(),
        name: image.name,
        url: image.url,
        publicId: image.publicId ?? null,
        type: 'PROJECT',
        createdAt: now,
        updatedAt: now,
        projectId: projectId,
      }));

      return {
        projects: [
          {
            id: projectId,
            title: input.title,
            description: input.description || null,
            status: input.status,
            isActive: input.isActive,
            createdAt: now,
            updatedAt: now,
            createdById: input.createdById,
            images: images,
          },
          ...state.projects,
        ],
      };
    }),
}));
