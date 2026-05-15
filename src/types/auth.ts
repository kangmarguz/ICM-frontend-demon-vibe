export type Role = 'USER' | 'GUEST' | 'ADMIN';

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
  ownerId?: string;
  forceResetPassword?: boolean;
};
