import { getProjectStatusClassName } from '../../../lib/projectStatusStyles';
import type { Project } from '../../../types/project';

type ProjectReadOnlyDetailsProps = {
  canEdit: boolean;
  project: Project;
  saveSuccess: string;
  showActiveState: boolean;
};

export function ProjectReadOnlyDetails({ canEdit, project, saveSuccess, showActiveState }: ProjectReadOnlyDetailsProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-slate-700">Description</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{project.description || 'No description'}</p>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700">URL link</p>
        {project.urlLink ? (
          <a
            href={project.urlLink}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block break-all text-sm font-medium text-sky-700 hover:text-sky-800"
          >
            {project.urlLink}
          </a>
        ) : (
          <p className="mt-1 text-sm text-slate-500">No URL link</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={`rounded px-3 py-1 text-xs font-semibold uppercase ${getProjectStatusClassName(project.status)}`}>
          {project.status}
        </span>
        {showActiveState ? (
          <span
            className={`rounded px-3 py-1 text-xs font-semibold uppercase ${
              project.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {project.isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        ) : null}
      </div>

      {!canEdit ? <p className="text-sm text-slate-500">You can view this project but cannot edit it.</p> : null}
      {saveSuccess ? <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{saveSuccess}</div> : null}
    </div>
  );
}
