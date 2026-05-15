export type Role = 'USER' | 'GUEST' | 'ADMIN';

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
  siteId?: string | null;
  site?: {
    id: string;
    name: string;
    description?: string | null;
    isActive: boolean;
  } | null;
  ownerId?: string;
  forceResetPassword?: boolean;
};
