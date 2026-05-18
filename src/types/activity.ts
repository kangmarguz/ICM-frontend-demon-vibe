import type { Role } from './auth';

export type ProjectActivity = {
  id: string;
  projectId: string;
  action: string;
  message?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  } | null;
};
