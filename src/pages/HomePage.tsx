import { FolderKanban, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { useEffect, useMemo } from 'react';
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
  const { isLoadingProjects, loadProjects, loadProjectsError } = useLoadProjects(user);
  const projects = useMemo(() => getVisibleProjects(allProjects, user), [allProjects, user]);
  const activeProjects = useMemo(() => projects.filter((project) => project.isActive), [projects]);
  const imageCount = useMemo(
    () => projects.reduce((total, project) => total + project.images.length, 0),
    [projects],
  );
  const RoleIcon = roleContent[user.role].icon;

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-sky-50 text-sky-700">
              <RoleIcon size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{user.role}</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">{roleContent[user.role].title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{roleContent[user.role].description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Visible projects</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{projects.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Images</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{imageCount}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="font-semibold text-slate-950">Recent projects</h3>
            <p className="text-sm text-slate-500">{activeProjects.length} active projects in your visible workspace</p>
          </div>
          <FolderKanban className="text-slate-400" size={20} />
        </div>

        {projects.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">
            {isLoadingProjects ? 'Loading projects...' : loadProjectsError || 'No projects yet.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {projects.map((project) => (
              <div key={project.id} className="grid gap-3 px-6 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="font-medium text-slate-950">{project.title}</p>
                  {project.description ? <p className="mt-1 text-sm text-slate-500">{project.description}</p> : null}
                </div>
                <span className={`w-fit rounded px-3 py-1 text-xs font-semibold uppercase ${getProjectStatusClassName(project.status)}`}>
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
