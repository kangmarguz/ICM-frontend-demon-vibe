import { z } from 'zod';
import type { ImageType, ProjectStatus } from '../../types/project';

export type PendingImage = {
  id: string;
  file: File;
  previewUrl: string;
};

export type ProjectImageField = {
  type: ImageType;
  title: string;
  description: string;
};

export type CreateProjectFormPayload = {
  title: string;
  description?: string;
  status: ProjectStatus;
  isActive: boolean;
  images: Array<{
    name: string;
    file: File;
    type: ImageType;
  }>;
};

export const projectStatuses: ProjectStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export const projectSchema = z.object({
  title: z.string().trim().min(1, 'Project title is required'),
  description: z.string().trim().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  isActive: z.boolean(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
