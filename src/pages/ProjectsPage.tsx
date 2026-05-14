import { Plus, Search, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProjectList } from '../components/projects/ProjectList';
import { useLoadProjects } from '../hooks/useLoadProjects';
import { useAuthStore } from '../stores/authStore';
import { getVisibleProjects, useProjectStore } from '../stores/projectStore';

export function ProjectsPage() {
  const user = useAuthStore((state) => state.user)!;
  const allProjects = useProjectStore((state) => state.projects);
  const [searchTerm, setSearchTerm] = useState('');
  const { isLoadingProjects, loadProjects, loadProjectsError } = useLoadProjects(user);
  const projects = useMemo(() => getVisibleProjects(allProjects, user), [allProjects, user]);
  const showActiveState = user.role !== 'USER';
  const filteredProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return projects;
    }

    return projects.filter((project) => {
      const searchableText = [
        project.title,
        project.description ?? '',
        project.status,
        showActiveState ? (project.isActive ? 'active' : 'inactive') : '',
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [projects, searchTerm, showActiveState]);
  const canCreate = user.role === 'USER' || user.role === 'ADMIN';

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-5"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.3, ease: 'easeOut' }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Projects</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Project list</h2>
          <p className="mt-1 text-sm text-slate-500">Browse projects available to your current role.</p>
        </div>

        {canCreate ? (
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }}>
            <Link
              to="/projects/new"
              className="flex items-center gap-2 rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-sky-100 hover:bg-sky-700 hover:shadow-md hover:shadow-sky-100"
            >
              <Plus size={16} />
              Add project
            </Link>
          </motion.div>
        ) : null}
      </motion.div>

      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
        <label className="relative block">
          <span className="sr-only">Search projects</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search projects"
            className="h-11 w-full rounded border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-500"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
              title="Clear search"
              className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          ) : null}
        </label>
      </div>

      <ProjectList
        emptyMessage={searchTerm.trim() ? 'No matching projects.' : 'No projects yet.'}
        errorMessage={loadProjectsError}
        isLoading={isLoadingProjects}
        projects={filteredProjects}
        showActiveState={showActiveState}
      />
    </motion.div>
  );
}
