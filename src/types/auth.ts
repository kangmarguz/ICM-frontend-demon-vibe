export type Role = 'USER' | 'GUEST' | 'ADMIN';

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  ownerId?: string;
  forceResetPassword?: boolean;
};
