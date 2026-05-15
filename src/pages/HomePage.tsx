import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { HomeWorkspaceSummary } from '../components/home/HomeWorkspaceSummary';
import { RecentProjectsSection } from '../components/home/RecentProjectsSection';
import {
  getProjectStatusFilters,
  paginateProjects,
  type ProjectStatusFilter,
} from '../components/projects/projectListControls';
import { useLoadProjects } from '../hooks/useLoadProjects';
import { useAuthStore } from '../stores/authStore';
import { getVisibleProjects, useProjectStore } from '../stores/projectStore';

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
      <HomeWorkspaceSummary projectCount={projects.length} role={user.role} />

      <RecentProjectsSection
        activeProjectCount={activeProjects.length}
        errorMessage={loadProjectsError}
        filteredProjects={filteredProjects}
        isLoading={isLoadingProjects}
        onPageChange={setCurrentPage}
        onStatusFilterChange={setStatusFilter}
        paginatedProjects={paginatedProjects}
        projects={projects}
        showActiveState={showActiveState}
        statusFilter={statusFilter}
        statusFilters={statusFilters}
      />
    </motion.div>
  );
}
