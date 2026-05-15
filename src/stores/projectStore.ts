import { create } from 'zustand';
import type { AppUser } from '../types/auth';
import type { ImageType, Project, ProjectImage, ProjectStatus } from '../types/project';

type CreateProjectImageInput = {
  name: string;
  url: string;
  publicId?: string | null;
  type: ImageType;
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
  actionAddProject: (project: Project) => void;
  actionSetProjects: (projects: Project[]) => void;
  actionUpdateProject: (project: Project) => void;
  createProject: (input: CreateProjectInput) => void;
};

export function getVisibleProjects(projects: Project[], user: AppUser) {
  if (user.role === 'ADMIN') {
    return projects;
  }

  if (user.role === 'GUEST') {
    return projects;
  }

  return projects.filter((project) => project.createdById === user.id);
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  actionAddProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects],
    })),
  actionSetProjects: (projects) =>
    set({
      projects: projects,
    }),
  actionUpdateProject: (project) =>
    set((state) => ({
      projects: state.projects.map((item) => (item.id === project.id ? project : item)),
    })),
  createProject: (input) =>
    set((state) => {
      const now = new Date().toISOString();
      const projectId = crypto.randomUUID();
      const images: ProjectImage[] = input.images.map((image) => ({
        id: crypto.randomUUID(),
        name: image.name,
        url: image.url,
        publicId: image.publicId ?? null,
        type: image.type,
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
