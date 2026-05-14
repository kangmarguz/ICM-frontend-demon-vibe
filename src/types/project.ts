export type ProjectStatus = 'PENDING' | 'PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ImageType = 'IMAGE_2D' | 'IMAGE_3D' | 'PAY_SLIP';

export type ProjectImage = {
  id: string;
  name: string;
  url: string;
  publicId?: string | null;
  type: ImageType;
  createdAt: string;
  updatedAt: string;
  projectId: string;
};

export type Project = {
  id: string;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById?: string | null;
  images: ProjectImage[];
};
