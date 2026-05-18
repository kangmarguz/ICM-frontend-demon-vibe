import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { Edit3, LoaderCircle, MapPin, Plus, RefreshCw, Search, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toastAsync } from '../lib/toast';
import { createSite, fetchSites, updateSite } from '../services/siteApi';
import type { Site } from '../types/site';

const siteSchema = z.object({
  name: z.string().trim().min(1, 'Site name is required'),
  description: z.string(),
  isActive: z.boolean(),
});

type SiteFormData = z.infer<typeof siteSchema>;

type ApiErrorResponse = {
  message?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiErrorResponse | undefined)?.message ?? fallback;
  }

  return fallback;
}

export function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingSiteId, setPendingSiteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  });

  const loadSites = useCallback(async ({ showLoading = true }: { showLoading?: boolean } = {}) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      setError('');
      const loadedSites = await fetchSites();
      setSites(loadedSites);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Cannot load sites.'));
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  const filteredSites = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return sites;
    }

    return sites.filter((site) =>
      [site.name, site.description ?? '', site.isActive ? 'active' : 'inactive'].join(' ').toLowerCase().includes(query),
    );
  }, [searchText, sites]);

  const openCreateForm = () => {
    setError('');
    setSuccess('');
    setEditingSite(null);
    reset({ name: '', description: '', isActive: true });
    setShowForm(true);
  };

  const openEditForm = (site: Site) => {
    setError('');
    setSuccess('');
    setEditingSite(site);
    reset({ name: site.name, description: site.description ?? '', isActive: site.isActive });
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingSite(null);
    setShowForm(false);
    reset({ name: '', description: '', isActive: true });
  };

  const handleSaveSite = async (data: SiteFormData) => {
    try {
      setError('');
      setSuccess('');

      if (editingSite) {
        await toastAsync(
          () => updateSite(editingSite.id, data),
          {
            pending: 'Updating site...',
            success: 'Site updated.',
            error: 'Cannot save site.',
          },
        );
        setSuccess('Site updated.');
      } else {
        await toastAsync(
          () => createSite(data),
          {
            pending: 'Creating site...',
            success: 'Site created.',
            error: 'Cannot save site.',
          },
        );
        setSuccess('Site created.');
      }

      closeForm();
      await loadSites({ showLoading: false });
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Cannot save site.'));
      throw saveError;
    }
  };

  const handleToggleActive = async (site: Site) => {
    try {
      setError('');
      setSuccess('');
      setPendingSiteId(site.id);
      const updatedSite = await toastAsync(
        () => updateSite(site.id, { isActive: !site.isActive }),
        {
          pending: 'Updating site status...',
          success: (response) => `${response?.name ?? 'Site'} is now ${response?.isActive ? 'active' : 'inactive'}.`,
          error: 'Cannot update site status.',
        },
      );

      if (updatedSite) {
        setSuccess(`${updatedSite.name} is now ${updatedSite.isActive ? 'active' : 'inactive'}.`);
      }

      await loadSites({ showLoading: false });
    } catch (toggleError) {
      setError(getErrorMessage(toggleError, 'Cannot update site status.'));
    } finally {
      setPendingSiteId(null);
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Sites</h2>
          <p className="text-sm text-slate-500">Add, edit, and manage active site records.</p>
        </div>

        <motion.button
          type="button"
          onClick={openCreateForm}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
          className="inline-flex w-fit items-center gap-2 rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
        >
          <Plus size={16} />
          Add site
        </motion.button>
      </div>

      <div className="space-y-5 p-6">
        {showForm ? (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onSubmit={handleSubmit(handleSaveSite)}
            className="grid gap-4 rounded-lg border border-slate-200 p-4 lg:grid-cols-[1fr_1.4fr_160px_auto]"
          >
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Name</span>
              <input
                {...register('name')}
                disabled={isSubmitting}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
                placeholder="Site name"
              />
              {errors.name ? <p className="mt-1 text-sm text-rose-600">{errors.name.message}</p> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Description</span>
              <input
                {...register('description')}
                disabled={isSubmitting}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
                placeholder="Optional details"
              />
            </label>

            <label className="flex items-end gap-2 pb-2 text-sm font-medium text-slate-700">
              <input
                {...register('isActive')}
                type="checkbox"
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              Active
            </label>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : editingSite ? <Edit3 size={16} /> : <Plus size={16} />}
                {isSubmitting ? 'Saving...' : editingSite ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={closeForm}
                className="inline-flex items-center gap-2 rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <X size={16} />
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
              placeholder="Search sites"
            />
          </label>
          <p className="text-sm text-slate-500">
            Showing {filteredSites.length} of {sites.length} sites
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Site</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">Loading sites...</td>
                </tr>
              ) : sites.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No sites found.</td>
                </tr>
              ) : filteredSites.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No sites match your search.</td>
                </tr>
              ) : (
                filteredSites.map((site) => {
                  const isPending = pendingSiteId === site.id;

                  return (
                    <tr key={site.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded bg-slate-100 text-slate-700">
                            <MapPin size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-950">{site.name}</p>
                            <p className="text-xs text-slate-500">{site.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={['rounded px-2.5 py-1 text-xs font-semibold', site.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'].join(' ')}>
                          {site.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{site.updatedAt ?? '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(site)}
                            disabled={isPending}
                            className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(site)}
                            disabled={isPending}
                            className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                          >
                            <RefreshCw size={14} />
                            {site.isActive ? 'Deactivate' : 'Activate'}
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
