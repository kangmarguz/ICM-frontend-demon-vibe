import { FolderKanban } from 'lucide-react';
import { motion } from 'motion/react';
import { getProjectStatusClassName } from '../../lib/projectStatusStyles';
import type { Project } from '../../types/project';
import { ProjectPagination } from '../projects/ProjectPagination';
import { ProjectStatusFilterControl } from '../projects/ProjectStatusFilter';
import type { ProjectStatusFilter } from '../projects/projectListControls';

type RecentProjectsSectionProps = {
  activeProjectCount: number;
  errorMessage?: string;
  filteredProjects: Project[];
  isLoading: boolean;
  paginatedProjects: {
    currentPage: number;
    totalPages: number;
    items: Project[];
  };
  projects: Project[];
  showActiveState: boolean;
  statusFilter: ProjectStatusFilter;
  statusFilters: ProjectStatusFilter[];
  onPageChange: (page: number) => void;
  onStatusFilterChange: (value: ProjectStatusFilter) => void;
};

export function RecentProjectsSection({
  activeProjectCount,
  errorMessage,
  filteredProjects,
  isLoading,
  onPageChange,
  onStatusFilterChange,
  paginatedProjects,
  projects,
  showActiveState,
  statusFilter,
  statusFilters,
}: RecentProjectsSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3, ease: 'easeOut' }}
      className="rounded-lg border border-slate-200 bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
        <div>
          <h3 className="font-semibold text-slate-950">Recent projects</h3>
          <p className="text-sm text-slate-500">
            {showActiveState
              ? `${activeProjectCount} active projects in your visible workspace`
              : `${projects.length} projects in your workspace`}
          </p>
        </div>
        <FolderKanban className="text-slate-400" size={20} />
      </div>

      <div className="border-b border-slate-200 px-6 py-4">
        <ProjectStatusFilterControl filters={statusFilters} value={statusFilter} onChange={onStatusFilterChange} />
      </div>

      {projects.length === 0 ? (
        <div className="px-6 py-10 text-sm text-slate-500">
          {isLoading ? 'Loading projects...' : errorMessage || 'No projects yet.'}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="px-6 py-10 text-sm text-slate-500">No projects match this status.</div>
      ) : (
        <>
          <div className="divide-y divide-slate-200">
            {paginatedProjects.items.map((project) => (
              <motion.div
                layout
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="grid gap-3 px-6 py-4 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div>
                  <p className="font-medium text-slate-950">{project.title}</p>
                  {project.description ? <p className="mt-1 text-sm text-slate-500">{project.description}</p> : null}
                </div>
                <span className={`w-fit rounded px-3 py-1 text-xs font-semibold uppercase ${getProjectStatusClassName(project.status)}`}>
                  {project.status}
                </span>
              </motion.div>
            ))}
          </div>
          <ProjectPagination
            currentPage={paginatedProjects.currentPage}
            totalPages={paginatedProjects.totalPages}
            onPageChange={onPageChange}
          />
        </>
      )}
    </motion.section>
  );
}
