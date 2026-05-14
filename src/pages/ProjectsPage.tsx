import { AxiosError } from 'axios';
import { useMemo, useState } from 'react';
import { ProjectForm } from '../components/projects/ProjectForm';
import type { CreateProjectFormPayload } from '../components/projects/projectFormSchema';
import { ProjectList } from '../components/projects/ProjectList';
import { resizeImageToBase64 } from '../lib/resizeImageToBase64';
import { createProject as createProjectApi } from '../services/projectApi';
import { uploadToCloudinary } from '../services/uploadApi';
import { useAuthStore } from '../stores/authStore';
import { getVisibleProjects, useProjectStore } from '../stores/projectStore';
import type { Project } from '../types/project';

type ApiErrorResponse = {
  message?: string;
};

export function ProjectsPage() {
  const user = useAuthStore((state) => state.user)!;
  const allProjects = useProjectStore((state) => state.projects);
  const actionAddProject = useProjectStore((state) => state.actionAddProject);
  const [createError, setCreateError] = useState('');
  const projects = useMemo(() => getVisibleProjects(allProjects, user), [allProjects, user]);

  const canCreate = user.role === 'USER' || user.role === 'ADMIN';
  const helperText = useMemo(() => {
    if (user.role === 'ADMIN') {
      return 'ADMIN can create and manage projects. Backend API integration can replace this local store later.';
    }

    if (user.role === 'GUEST') {
      return 'GUEST can view assigned projects only.';
    }

    return 'USER can create and manage only their own projects.';
  }, [user.role]);

  const handleCreateProject = async (payload: CreateProjectFormPayload) => {
    try {
      setCreateError('');

      const uploadedImages = await Promise.all(
        payload.images.map(async (image) => {
          const base64 = await resizeImageToBase64(image.file, {
            maxHeight: 720,
            maxWidth: 720,
            quality: 0.8,
          });

          const uploadedImage = await uploadToCloudinary({
            name: image.name,
            file: base64,
            type: image.type,
          });
          
          return {
            name: uploadedImage.name,
            url: uploadedImage.url,
            publicId: uploadedImage.publicId ?? null,
            type: image.type,
          };
        }),
      );

      const createdProject = await createProjectApi({
        title: payload.title,
        description: payload.description,
        status: payload.status,
        isActive: payload.isActive,
        images: uploadedImages,
      });

      actionAddProject(normalizeProjectForClient(createdProject, user.id));
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as ApiErrorResponse | undefined)?.message
          : undefined;

      setCreateError(message ?? 'Cannot create project. Please check project data and uploaded files.');
      throw error;
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <ProjectForm canCreate={canCreate} errorMessage={createError} helperText={helperText} onCreate={handleCreateProject} />
      <ProjectList projects={projects} />
    </div>
  );
}

function normalizeProjectForClient(project: Project, fallbackUserId: string): Project {
  const now = new Date().toISOString();

  return {
    ...project,
    description: project.description ?? null,
    createdAt: project.createdAt ?? now,
    updatedAt: project.updatedAt ?? now,
    createdById: project.createdById ?? fallbackUserId,
    images: project.images ?? [],
  };
}
