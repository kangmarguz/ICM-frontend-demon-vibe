import { Settings, X } from 'lucide-react';
import { motion } from 'motion/react';
import type { FormEventHandler } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { AppUser } from '../../../types/auth';
import type { Project } from '../../../types/project';
import { ProjectEditForm, type EditProjectFormData } from './ProjectEditForm';
import { ProjectReadOnlyDetails } from './ProjectReadOnlyDetails';

type ProjectInfoPanelProps = {
  canEdit: boolean;
  errors: FieldErrors<EditProjectFormData>;
  isEditing: boolean;
  isSubmitting: boolean;
  isUploadingImages: boolean;
  assignableUsers: AppUser[];
  project: Project;
  register: UseFormRegister<EditProjectFormData>;
  saveError: string;
  saveSuccess: string;
  showActiveState: boolean;
  showProjectControls: boolean;
  onCancelEditing: () => void;
  onStartEditing: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function ProjectInfoPanel({
  canEdit,
  errors,
  isEditing,
  isSubmitting,
  isUploadingImages,
  assignableUsers,
  onCancelEditing,
  onStartEditing,
  onSubmit,
  project,
  register,
  saveError,
  saveSuccess,
  showActiveState,
  showProjectControls,
}: ProjectInfoPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.3, ease: 'easeOut' }}
      className="rounded-lg border border-slate-200 bg-white p-5"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-950">{isEditing ? 'Edit project' : project.title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {isEditing ? 'Update project information and manage uploaded images.' : 'Project information is read-only until you open edit mode.'}
          </p>
        </div>

        {canEdit ? (
          isEditing ? (
            <button
              type="button"
              onClick={onCancelEditing}
              disabled={isSubmitting || isUploadingImages}
              aria-label="Cancel editing"
              title="Cancel editing"
              className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartEditing}
              aria-label="Edit project"
              title="Edit project"
              className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Settings size={18} />
            </button>
          )
        ) : null}
      </div>

      {isEditing ? (
        <ProjectEditForm
          assignableUsers={assignableUsers}
          canEdit={canEdit}
          errors={errors}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          register={register}
          saveError={saveError}
          saveSuccess={saveSuccess}
          showProjectControls={showProjectControls}
        />
      ) : (
        <ProjectReadOnlyDetails
          canEdit={canEdit}
          project={project}
          saveSuccess={saveSuccess}
          showActiveState={showActiveState}
        />
      )}
    </motion.section>
  );
}
