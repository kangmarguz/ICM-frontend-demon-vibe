import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { Edit3, Plus, RefreshCw, Search, Tags, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createCategory, fetchCategories, updateCategory } from '../services/categoryApi';
import type { Category } from '../types/category';

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required'),
  description: z.string(),
  isActive: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

type ApiErrorResponse = {
  message?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiErrorResponse | undefined)?.message ?? fallback;
  }

  return fallback;
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchText, setSearchText] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  });

  const loadCategories = useCallback(
    async ({ showLoading = true }: { showLoading?: boolean } = {}) => {
      try {
        if (showLoading) {
          setIsLoading(true);
        }

        setError('');
        const loadedCategories = await fetchCategories();
        setCategories(loadedCategories);
      } catch (loadError) {
        setError(getErrorMessage(loadError, 'Cannot load categories.'));
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) => {
      const searchValue = [
        category.name,
        category.description ?? '',
        category.isActive ? 'active' : 'inactive',
      ]
        .join(' ')
        .toLowerCase();

      return searchValue.includes(query);
    });
  }, [categories, searchText]);

  const openCreateForm = () => {
    setError('');
    setSuccess('');
    setEditingCategory(null);
    reset({
      name: '',
      description: '',
      isActive: true,
    });
    setShowForm(true);
  };

  const openEditForm = (category: Category) => {
    setError('');
    setSuccess('');
    setEditingCategory(category);
    reset({
      name: category.name,
      description: category.description ?? '',
      isActive: category.isActive,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingCategory(null);
    setShowForm(false);
    reset({
      name: '',
      description: '',
      isActive: true,
    });
  };

  const handleSaveCategory = async (data: CategoryFormData) => {
    try {
      setError('');
      setSuccess('');

      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: data.name,
          description: data.description,
          isActive: data.isActive,
        });
        setSuccess('Category updated.');
      } else {
        await createCategory({
          name: data.name,
          description: data.description,
          isActive: data.isActive,
        });
        setSuccess('Category created.');
      }

      closeForm();
      await loadCategories({ showLoading: false });
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Cannot save category.'));
      throw saveError;
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      setError('');
      setSuccess('');
      setPendingCategoryId(category.id);
      const updatedCategory = await updateCategory(category.id, {
        isActive: !category.isActive,
      });

      if (updatedCategory) {
        setSuccess(`${updatedCategory.name} is now ${updatedCategory.isActive ? 'active' : 'inactive'}.`);
      }

      await loadCategories({ showLoading: false });
    } catch (toggleError) {
      setError(getErrorMessage(toggleError, 'Cannot update category status.'));
    } finally {
      setPendingCategoryId(null);
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Categories</h2>
          <p className="text-sm text-slate-500">Add, edit, and manage active category records.</p>
        </div>

        <motion.button
          type="button"
          onClick={openCreateForm}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
          className="inline-flex w-fit items-center gap-2 rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
        >
          <Plus size={16} />
          Add category
        </motion.button>
      </div>

      <div className="space-y-5 p-6">
        {showForm ? (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onSubmit={handleSubmit(handleSaveCategory)}
            className="grid gap-4 rounded-lg border border-slate-200 p-4 lg:grid-cols-[1fr_1.4fr_160px_auto]"
          >
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Name</span>
              <input
                {...register('name')}
                disabled={isSubmitting}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
                placeholder="Category name"
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
                {editingCategory ? <Edit3 size={16} /> : <Plus size={16} />}
                {isSubmitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
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
              placeholder="Search categories"
            />
          </label>
          <p className="text-sm text-slate-500">
            Showing {filteredCategories.length} of {categories.length} categories
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No categories found.
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No categories match your search.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => {
                  const isPending = pendingCategoryId === category.id;

                  return (
                    <tr key={category.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded bg-slate-100 text-slate-700">
                            <Tags size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-950">{category.name}</p>
                            <p className="text-xs text-slate-500">{category.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={[
                            'rounded px-2.5 py-1 text-xs font-semibold',
                            category.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
                          ].join(' ')}
                        >
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{category.updatedAt ?? '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(category)}
                            disabled={isPending}
                            className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(category)}
                            disabled={isPending}
                            className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                          >
                            <RefreshCw size={14} />
                            {category.isActive ? 'Deactivate' : 'Activate'}
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
