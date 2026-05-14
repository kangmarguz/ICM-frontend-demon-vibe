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

export const imageFields: ProjectImageField[] = [
  {
    type: 'IMAGE_2D',
    title: '2D images',
    description: 'Upload plan, drawing, or flat reference images.',
  },
  {
    type: 'IMAGE_3D',
    title: '3D images',
    description: 'Upload 3D preview, render, or model reference images.',
  },
  {
    type: 'PAY_SLIP',
    title: 'Pay slip',
    description: 'Upload payment slip or payment evidence.',
  },
];

export const projectSchema = z.object({
  title: z.string().trim().min(1, 'Project title is required'),
  description: z.string().trim().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  isActive: z.boolean(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
