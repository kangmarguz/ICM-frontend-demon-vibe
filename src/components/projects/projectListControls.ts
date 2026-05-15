import type { ProjectStatus } from '../../types/project';

export const PROJECTS_PER_PAGE = 10;

export type ProjectStatusFilter = 'ALL' | ProjectStatus;

export function getProjectStatusFilters(isAdmin: boolean): ProjectStatusFilter[] {
  const filters: ProjectStatusFilter[] = ['ALL', 'PENDING', 'PROGRESS', 'COMPLETED'];

  if (isAdmin) {
    filters.push('CANCELLED');
  }

  return filters;
}

export function paginateProjects<T>(items: T[], page: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / PROJECTS_PER_PAGE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;

  return {
    currentPage,
    totalPages,
    items: items.slice(startIndex, startIndex + PROJECTS_PER_PAGE),
  };
}
