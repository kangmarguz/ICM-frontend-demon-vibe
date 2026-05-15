import { Save } from 'lucide-react';
import { motion } from 'motion/react';
import type { FormEventHandler } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { projectStatuses } from '../projectFormSchema';

export type EditProjectFormData = {
  title: string;
  description?: string;
  urlLink?: string;
  status: 'PENDING' | 'PROGRESS' | 'COMPLETED' | 'CANCELLED';
  isActive: boolean;
};

type ProjectEditFormProps = {
  canEdit: boolean;
  errors: FieldErrors<EditProjectFormData>;
  isSubmitting: boolean;
  register: UseFormRegister<EditProjectFormData>;
  saveError: string;
  saveSuccess: string;
  showProjectControls: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function ProjectEditForm({
  canEdit,
  errors,
  isSubmitting,
  onSubmit,
  register,
  saveError,
  saveSuccess,
  showProjectControls,
}: ProjectEditFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Title</span>
        <input
          {...register('title')}
          disabled={!canEdit || isSubmitting}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
        />
        {errors.title ? <p className="mt-1 text-sm text-rose-600">{errors.title.message}</p> : null}
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Description</span>
        <textarea
          {...register('description')}
          disabled={!canEdit || isSubmitting}
          className="mt-1 min-h-32 w-full resize-none rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">URL link</span>
        <input
          {...register('urlLink')}
          type="url"
          disabled={!canEdit || isSubmitting}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
          placeholder="https://example.com/project"
        />
        {errors.urlLink ? <p className="mt-1 text-sm text-rose-600">{errors.urlLink.message}</p> : null}
      </label>

      {showProjectControls ? (
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Status</span>
            <select
              {...register('status')}
              disabled={!canEdit || isSubmitting}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
            >
              {projectStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 rounded border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              {...register('isActive')}
              disabled={!canEdit || isSubmitting}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            Active
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <motion.button
          type="submit"
          disabled={!canEdit || isSubmitting}
          whileHover={!canEdit || isSubmitting ? undefined : { y: -1 }}
          whileTap={!canEdit || isSubmitting ? undefined : { scale: 0.99 }}
          className="flex items-center gap-2 rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Save size={16} />
          {isSubmitting ? 'Saving...' : 'Save changes'}
        </motion.button>
      </div>

      {saveError ? <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{saveError}</div> : null}
      {saveSuccess ? <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{saveSuccess}</div> : null}
    </form>
  );
}
