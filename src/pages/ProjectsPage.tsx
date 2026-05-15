import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { ProjectListFilters } from '../components/projects/ProjectListFilters';
import { ProjectList } from '../components/projects/ProjectList';
import { ProjectPagination } from '../components/projects/ProjectPagination';
import { ProjectsPageHeader } from '../components/projects/ProjectsPageHeader';
import {
  getProjectStatusFilters,
  paginateProjects,
  type ProjectStatusFilter,
} from '../components/projects/projectListControls';
import { useLoadProjects } from '../hooks/useLoadProjects';
import { useAuthStore } from '../stores/authStore';
import { getVisibleProjects, useProjectStore } from '../stores/projectStore';

export function ProjectsPage() {
  const user = useAuthStore((state) => state.user)!;
  const allProjects = useProjectStore((state) => state.projects);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const { isLoadingProjects, loadProjects, loadProjectsError } = useLoadProjects(user);
  const projects = useMemo(() => getVisibleProjects(allProjects, user), [allProjects, user]);
  const isAdmin = user.role === 'ADMIN';
  const showActiveState = user.role !== 'USER';
  const statusFilters = useMemo(() => getProjectStatusFilters(isAdmin), [isAdmin]);
  const filteredProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      if (statusFilter !== 'ALL' && project.status !== statusFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

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
  }, [projects, searchTerm, showActiveState, statusFilter]);
  const paginatedProjects = useMemo(
    () => paginateProjects(filteredProjects, currentPage),
    [currentPage, filteredProjects],
  );
  const canCreate = user.role === 'USER' || user.role === 'ADMIN';

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
  }, [searchTerm, statusFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-5"
    >
      <ProjectsPageHeader canCreate={canCreate} />

      <ProjectListFilters
        onSearchTermChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        statusFilters={statusFilters}
      />

      <ProjectList
        emptyMessage={searchTerm.trim() || statusFilter !== 'ALL' ? 'No matching projects.' : 'No projects yet.'}
        errorMessage={loadProjectsError}
        footer={
          <ProjectPagination
            currentPage={paginatedProjects.currentPage}
            totalPages={paginatedProjects.totalPages}
            onPageChange={setCurrentPage}
          />
        }
        isLoading={isLoadingProjects}
        projects={paginatedProjects.items}
        showActiveState={showActiveState}
      />
    </motion.div>
  );
}
