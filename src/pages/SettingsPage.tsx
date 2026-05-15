import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, Save, Settings, UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getApiErrorMessage, toastAsync } from '../lib/toast';
import { updateUser } from '../services/authApi';
import { useAuthStore } from '../stores/authStore';

const DEFAULT_RESET_PASSWORD = '12345678';

const createSettingsSchema = (forceResetPassword: boolean) =>
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

type SettingsFormData = z.infer<ReturnType<typeof createSettingsSchema>>;

export function SettingsPage() {
  const user = useAuthStore((state) => state.user)!;
  const actionSetUser = useAuthStore((state) => state.actionSetUser);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const forceResetPassword = Boolean(user.forceResetPassword);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(createSettingsSchema(forceResetPassword)),
    defaultValues: {
      name: user.name,
      oldPassword: forceResetPassword ? DEFAULT_RESET_PASSWORD : '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    reset({
      name: user.name,
      oldPassword: forceResetPassword ? DEFAULT_RESET_PASSWORD : '',
      password: '',
      confirmPassword: '',
    });
  }, [forceResetPassword, reset, user.name]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setSaveError('');
      setSaveSuccess('');
      const oldPassword = forceResetPassword ? DEFAULT_RESET_PASSWORD : data.oldPassword;

      const updatedUser = await toastAsync(
        () =>
          updateUser(
            user.id,
            {
              name: data.name,
              ...(data.password ? { oldPassword, newPassword: data.password } : {}),
            },
            user,
          ),
        {
          pending: 'Saving settings...',
          success: 'Settings updated.',
          error: 'Cannot update settings.',
        },
      );

      actionSetUser(updatedUser);
      reset({
        name: updatedUser.name,
        oldPassword: '',
        password: '',
        confirmPassword: '',
      });
      setSaveSuccess('Settings updated.');
    } catch (error) {
      setSaveError(getApiErrorMessage(error, 'Cannot update settings.'));
      throw error;
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="rounded-lg border border-slate-200 bg-white"
    >
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.25, ease: 'easeOut' }}
            className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-slate-700"
          >
            <Settings size={20} />
          </motion.div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Settings</h2>
            <p className="text-sm text-slate-500">
              {forceResetPassword ? 'Change your password before continuing.' : 'Edit your current profile data.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[280px_1fr]">
        <motion.aside
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
          className="rounded-lg border border-slate-200 p-4"
        >
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded bg-sky-50 text-sky-700">
            <UserRound size={22} />
          </div>
          <p className="font-semibold text-slate-950">{user.name}</p>
          <p className="mt-1 text-sm text-slate-500">{user.email}</p>
          <p className="mt-3 w-fit rounded bg-sky-50 px-3 py-1 text-xs font-semibold uppercase text-sky-700">
            {user.role}
          </p>
        </motion.aside>

        <motion.form
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.3, ease: 'easeOut' }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              {...register('name')}
              disabled={isSubmitting}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
            />
            {errors.name ? <p className="mt-1 text-sm text-rose-600">{errors.name.message}</p> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              value={user.email}
              disabled
              className="mt-1 w-full rounded border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-500 outline-none"
            />
          </label>

          {forceResetPassword ? (
            <input type="hidden" {...register('oldPassword')} value={DEFAULT_RESET_PASSWORD} />
          ) : (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Old password</span>
              <input
                {...register('oldPassword')}
                type="password"
                disabled={isSubmitting}
                placeholder="Current password"
                autoComplete="current-password"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-sky-500 disabled:bg-slate-100"
              />
              {errors.oldPassword ? <p className="mt-1 text-sm text-rose-600">{errors.oldPassword.message}</p> : null}
            </label>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">New password</span>
              <input
                {...register('password')}
                type="password"
                disabled={isSubmitting}
                placeholder={forceResetPassword ? 'Required' : 'Leave blank to keep current'}
                autoComplete="new-password"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-sky-500 disabled:bg-slate-100"
              />
              {errors.password ? <p className="mt-1 text-sm text-rose-600">{errors.password.message}</p> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Confirm password</span>
              <input
                {...register('confirmPassword')}
                type="password"
                disabled={isSubmitting}
                placeholder="Repeat new password"
                autoComplete="new-password"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-sky-500 disabled:bg-slate-100"
              />
              {errors.confirmPassword ? <p className="mt-1 text-sm text-rose-600">{errors.confirmPassword.message}</p> : null}
            </label>
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={isSubmitting ? undefined : { y: -1 }}
            whileTap={isSubmitting ? undefined : { scale: 0.99 }}
            className="inline-flex items-center gap-2 rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
            {isSubmitting ? 'Saving...' : 'Save settings'}
          </motion.button>

          {saveError ? <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{saveError}</div> : null}
          {saveSuccess ? <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{saveSuccess}</div> : null}
        </motion.form>
      </div>
    </motion.section>
  );
}
