import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProjectList } from '../components/projects/ProjectList';
import { useLoadProjects } from '../hooks/useLoadProjects';
import { useAuthStore } from '../stores/authStore';
import { getVisibleProjects, useProjectStore } from '../stores/projectStore';

export function ProjectsPage() {
  const user = useAuthStore((state) => state.user)!;
  const allProjects = useProjectStore((state) => state.projects);
  const { isLoadingProjects, loadProjects, loadProjectsError } = useLoadProjects(user);
  const projects = useMemo(() => getVisibleProjects(allProjects, user), [allProjects, user]);
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

      <ProjectList errorMessage={loadProjectsError} isLoading={isLoadingProjects} projects={projects} />
    </motion.div>
  );
}
