import { FolderKanban, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { ProjectPagination } from '../components/projects/ProjectPagination';
import { ProjectStatusFilterControl } from '../components/projects/ProjectStatusFilter';
import {
  getProjectStatusFilters,
  paginateProjects,
  type ProjectStatusFilter,
} from '../components/projects/projectListControls';
import { useLoadProjects } from '../hooks/useLoadProjects';
import { getProjectStatusClassName } from '../lib/projectStatusStyles';
import { useAuthStore } from '../stores/authStore';
import { getVisibleProjects, useProjectStore } from '../stores/projectStore';
import type { Role } from '../types/auth';

const roleContent: Record<Role, { title: string; description: string; icon: typeof UserRound }> = {
  USER: {
    title: 'User workspace',
    description: 'Create projects and manage only projects created by your account.',
    icon: UserRound,
  },
  GUEST: {
    title: 'Guest workspace',
    description: 'View projects shared under the assigned owner account.',
    icon: UsersRound,
  },
  ADMIN: {
    title: 'Admin workspace',
    description: 'View and manage projects across the workspace.',
    icon: ShieldCheck,
  },
};

export function HomePage() {
  const user = useAuthStore((state) => state.user)!;
  const allProjects = useProjectStore((state) => state.projects);
  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const { isLoadingProjects, loadProjects, loadProjectsError } = useLoadProjects(user);
  const projects = useMemo(() => getVisibleProjects(allProjects, user), [allProjects, user]);
  const activeProjects = useMemo(() => projects.filter((project) => project.isActive), [projects]);
  const isAdmin = user.role === 'ADMIN';
  const showActiveState = user.role !== 'USER';
  const statusFilters = useMemo(() => getProjectStatusFilters(isAdmin), [isAdmin]);
  const filteredProjects = useMemo(
    () => projects.filter((project) => statusFilter === 'ALL' || project.status === statusFilter),
    [projects, statusFilter],
  );
  const paginatedProjects = useMemo(
    () => paginateProjects(filteredProjects, currentPage),
    [currentPage, filteredProjects],
  );
  const RoleIcon = roleContent[user.role].icon;

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (!isAdmin && statusFilter === 'CANCELLED') {
      setStatusFilter('ALL');
    }
  }, [isAdmin, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3, ease: 'easeOut' }}
          className="rounded-lg border border-slate-200 bg-white p-6"
        >
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.16, duration: 0.25, ease: 'easeOut' }}
              className="flex h-12 w-12 items-center justify-center rounded bg-sky-50 text-sky-700"
            >
              <RoleIcon size={24} />
            </motion.div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{user.role}</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">{roleContent[user.role].title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{roleContent[user.role].description}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.3, ease: 'easeOut' }}
          className="rounded-lg border border-slate-200 bg-white p-5"
        >
          <p className="text-sm text-slate-500">Visible projects</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{projects.length}</p>
        </motion.div>
      </section>

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
                ? `${activeProjects.length} active projects in your visible workspace`
                : `${projects.length} projects in your workspace`}
            </p>
          </div>
          <FolderKanban className="text-slate-400" size={20} />
        </div>
        <div className="border-b border-slate-200 px-6 py-4">
          <ProjectStatusFilterControl filters={statusFilters} value={statusFilter} onChange={setStatusFilter} />
        </div>

        {projects.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">
            {isLoadingProjects ? 'Loading projects...' : loadProjectsError || 'No projects yet.'}
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
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </motion.section>
    </motion.div>
  );
}
