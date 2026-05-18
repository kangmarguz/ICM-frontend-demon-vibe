import { z } from 'zod';

export const DEFAULT_RESET_PASSWORD = '12345678';

export const createSettingsSchema = (forceResetPassword: boolean) =>
  z
    .object({
      name: z.string().trim().min(1, 'Name is required'),
      oldPassword: z.string(),
      password: z.string().refine((value) => value.length === 0 || value.length >= 8, {
        message: 'Password must be at least 8 characters',
      }),
      confirmPassword: z.string(),
    })
    .refine((data) => !data.password || data.oldPassword.length > 0, {
      message: 'Old password is required to change password',
      path: ['oldPassword'],
    })
    .refine((data) => !forceResetPassword || data.password.length > 0, {
      message: 'New password is required',
      path: ['password'],
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });

export type SettingsFormData = z.infer<ReturnType<typeof createSettingsSchema>>;

export function getDefaultSettingsValues(name: string, forceResetPassword: boolean): SettingsFormData {
  return {
    name,
    oldPassword: forceResetPassword ? DEFAULT_RESET_PASSWORD : '',
    password: '',
    confirmPassword: '',
  };
}
