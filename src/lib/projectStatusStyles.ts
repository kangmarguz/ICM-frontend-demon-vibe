import type { ProjectStatus } from '../types/project';

export function getProjectStatusClassName(status: ProjectStatus) {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-800';
    case 'PROGRESS':
      return 'bg-sky-100 text-sky-800';
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800';
    case 'CANCEL':
      return 'bg-rose-100 text-rose-800';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}
