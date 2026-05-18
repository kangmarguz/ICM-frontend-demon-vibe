import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { KeyRound, LoaderCircle, Plus, RefreshCw, Search, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toastAsync } from '../lib/toast';
import { fetchSites } from '../services/siteApi';
import { createUser, fetchUsers, resetUserPassword, updateUserActive, updateUserSite } from '../services/userApi';
import { useAuthStore } from '../stores/authStore';
import type { AppUser, Role } from '../types/auth';
import type { Site } from '../types/site';

const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Email format is invalid'),
  role: z.enum(['USER', 'ADMIN', 'GUEST']),
  siteId: z.string().trim().optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

type ApiErrorResponse = {
  message?: string;
};

const roleIcon = {
  USER: UserRound,
  GUEST: UsersRound,
  ADMIN: ShieldCheck,
};

const roleOptions: Role[] = ['USER', 'ADMIN', 'GUEST'];

function isUserActive(user: AppUser) {
  return user.isActive !== false;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiErrorResponse | undefined)?.message ?? fallback;
  }

  return fallback;
}

export function UsersPage() {
  const currentUser = useAuthStore((state) => state.user)!;
  const [users, setUsers] = useState<AppUser[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchText, setSearchText] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'USER',
      siteId: '',
    },
  });

  const loadUsers = useCallback(
    async ({ showLoading = true, showError = true }: { showLoading?: boolean; showError?: boolean } = {}) => {
      try {
        if (showLoading) {
          setIsLoading(true);
        }
        setError('');
        const loadedUsers = await fetchUsers();

        setUsers(loadedUsers);
      } catch (loadError) {
        if (showError) {
          setError(getErrorMessage(loadError, 'Cannot load users.'));
        }
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    let isMounted = true;

    async function loadSites() {
      try {
        const loadedSites = await fetchSites();

        if (isMounted) {
          setSites(loadedSites.filter((site) => site.isActive));
        }
      } catch (loadError) {
        if (isMounted) {
          setError(getErrorMessage(loadError, 'Cannot load sites.'));
        }
      }
    }

    loadSites();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      const active = isUserActive(user);
      const searchValue = [
        user.name,
        user.email,
        user.site?.name ?? '',
        user.role,
        active ? 'active' : 'inactive',
        user.forceResetPassword ? 'reset required' : 'reset clear',
      ]
        .join(' ')
        .toLowerCase();

      return searchValue.includes(query);
    });
  }, [searchText, users]);

  const handleCreateUser = async (data: CreateUserFormData) => {
    try {
      setError('');
      setSuccess('');
      const result = await toastAsync(
        () =>
          createUser({
            name: data.name,
            email: data.email,
            role: data.role,
            siteId: data.siteId?.trim() || undefined,
          }),
        {
          pending: 'Creating user...',
          success: (response) => `User created. Default password: ${response.defaultPassword ?? '12345678'}`,
          error: 'Cannot create user.',
        },
      );

      reset();
      setShowCreateForm(false);
      setSuccess(`User created. Default password: ${result.defaultPassword ?? '12345678'}`);
      await loadUsers({ showLoading: false });
    } catch (createError) {
      setError(getErrorMessage(createError, 'Cannot create user.'));
      throw createError;
    }
  };

  const handleToggleActive = async (user: AppUser) => {
    try {
      setError('');
      setSuccess('');
      setPendingUserId(user.id);
      const updatedUser = await toastAsync(
        () => updateUserActive(user.id, !isUserActive(user)),
        {
          pending: 'Updating user status...',
          success: (response) => `${response?.name ?? 'User'} is now ${response?.isActive !== false ? 'active' : 'inactive'}.`,
          error: 'Cannot update user status.',
        },
      );

      if (updatedUser) {
        setSuccess(`${updatedUser.name} is now ${isUserActive(updatedUser) ? 'active' : 'inactive'}.`);
      }

      await loadUsers({ showLoading: false });
    } catch (toggleError) {
      setError(getErrorMessage(toggleError, 'Cannot update user status.'));
    } finally {
      setPendingUserId(null);
    }
  };

  const handleChangeSite = async (user: AppUser, siteId: string) => {
    try {
      setError('');
      setSuccess('');
      setPendingUserId(user.id);
      const updatedUser = await toastAsync(
        () => updateUserSite(user.id, siteId),
        {
          pending: 'Updating user site...',
          success: (response) => `${response?.name ?? 'User'} site updated.`,
          error: 'Cannot update user site.',
        },
      );

      if (updatedUser) {
        setSuccess(`${updatedUser.name} site updated.`);
      }

      await loadUsers({ showLoading: false });
    } catch (siteError) {
      setError(getErrorMessage(siteError, 'Cannot update user site.'));
    } finally {
      setPendingUserId(null);
    }
  };

  const handleResetPassword = async (user: AppUser) => {
    try {
      setError('');
      setSuccess('');
      setPendingUserId(user.id);
      const updatedUser = await toastAsync(
        () => resetUserPassword(user.id),
        {
          pending: 'Resetting password...',
          success: (response) => `${response?.name ?? 'User'} password reset to 12345678.`,
          error: 'Cannot reset password.',
        },
      );

      if (updatedUser) {
        setSuccess(`${updatedUser.name} password reset to 12345678.`);
      }

      await loadUsers({ showLoading: false });
    } catch (resetError) {
      setError(getErrorMessage(resetError, 'Cannot reset password.'));
    } finally {
      setPendingUserId(null);
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Users</h2>
          <p className="text-sm text-slate-500">Manage account access, active status, and password resets.</p>
        </div>

        <motion.button
          type="button"
          onClick={() => {
            setError('');
            setSuccess('');
            setShowCreateForm((value) => !value);
          }}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
          className="inline-flex w-fit items-center gap-2 rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
        >
          <Plus size={16} />
          Create user
        </motion.button>
      </div>

      <div className="space-y-5 p-6">
        {showCreateForm ? (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onSubmit={handleSubmit(handleCreateUser)}
            className="grid gap-4 rounded-lg border border-slate-200 p-4 lg:grid-cols-[1fr_1fr_180px_220px_auto]"
          >
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Name</span>
              <input
                {...register('name')}
                disabled={isSubmitting}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
                placeholder="User name"
              />
              {errors.name ? <p className="mt-1 text-sm text-rose-600">{errors.name.message}</p> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                {...register('email')}
                type="email"
                disabled={isSubmitting}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
                placeholder="name@example.com"
              />
              {errors.email ? <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Role</span>
              <select
                {...register('role')}
                disabled={isSubmitting}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Site</span>
              <select
                {...register('siteId')}
                disabled={isSubmitting}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
              >
                <option value="">No site</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
              {errors.siteId ? <p className="mt-1 text-sm text-rose-600">{errors.siteId.message}</p> : null}
            </label>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />}
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  reset();
                  setShowCreateForm(false);
                }}
                className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        ) : null}

        {error ? <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}
        {success ? <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div> : null}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="relative block w-full md:max-w-sm">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="w-full rounded border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-sky-500"
              placeholder="Search users"
            />
          </label>
          <p className="text-sm text-slate-500">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Site</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reset</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No users match your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const Icon = roleIcon[user.role];
                  const isPending = pendingUserId === user.id;
                  const isCurrentUser = user.id === currentUser.id;
                  const active = isUserActive(user);

                  return (
                    <tr key={user.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded bg-slate-100 text-slate-700">
                            <Icon size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-950">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.siteId ?? ''}
                          onChange={(event) => handleChangeSite(user, event.target.value)}
                          disabled={isPending}
                          className="w-44 rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-sky-500 disabled:bg-slate-100"
                        >
                          <option value="">No site</option>
                          {sites.map((site) => (
                            <option key={site.id} value={site.id}>
                              {site.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={[
                            'rounded px-2.5 py-1 text-xs font-semibold',
                            active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
                          ].join(' ')}
                        >
                          {active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={[
                            'rounded px-2.5 py-1 text-xs font-semibold',
                            user.forceResetPassword ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600',
                          ].join(' ')}
                        >
                          {user.forceResetPassword ? 'Required' : 'Clear'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleResetPassword(user)}
                            disabled={isPending}
                            className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                          >
                            <KeyRound size={14} />
                            Reset
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(user)}
                            disabled={isPending || isCurrentUser}
                            className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                            title={isCurrentUser ? 'You cannot deactivate your own account' : undefined}
                          >
                            <RefreshCw size={14} />
                            {active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
