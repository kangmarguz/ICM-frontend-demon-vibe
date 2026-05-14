import { ImageIcon, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { getProjectStatusClassName } from '../../lib/projectStatusStyles';
import type { Project } from '../../types/project';

type ProjectListProps = {
  errorMessage?: string;
  isLoading?: boolean;
  projects: Project[];
};

export function ProjectList({ errorMessage, isLoading = false, projects }: ProjectListProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.35, ease: 'easeOut' }}
      className="rounded-lg border border-slate-200 bg-white"
    >
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-950">Projects</h2>
        <p className="text-sm text-slate-500">Project list is filtered by the current role.</p>
      </div>

      {isLoading ? (
        <div className="px-6 py-10 text-sm text-slate-500">Loading projects...</div>
      ) : errorMessage ? (
        <div className="px-6 py-10 text-sm text-rose-600">{errorMessage}</div>
      ) : projects.length === 0 ? (
        <div className="px-6 py-10 text-sm text-slate-500">No projects yet.</div>
      ) : (
        <div className="divide-y divide-slate-200">
          {projects.map((project) => (
            <motion.article
              layout
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              whileHover={{ y: -2, boxShadow: '0 12px 30px rgb(15 23 42 / 0.08)' }}
              className="px-6 py-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <Link to={`/projects/${project.id}`} className="block min-w-0 flex-1">
                  <div>
                    <h3 className="font-semibold text-slate-950">{project.title}</h3>
                    {project.description ? (
                      <p className="mt-1 text-sm leading-6 text-slate-500">{project.description}</p>
                    ) : null}
                  </div>
                </Link>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded px-3 py-1 text-xs font-semibold uppercase ${getProjectStatusClassName(project.status)}`}>
                      {project.status}
                    </span>
                    <span
                      className={`rounded px-3 py-1 text-xs font-semibold uppercase ${
                        project.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {project.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <Link
                    to={`/projects/${project.id}`}
                    aria-label={`Edit ${project.title}`}
                    title="Edit project"
                    className="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <Settings size={16} />
                  </Link>
                </div>
              </div>

              {project.images.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {project.images.map((image) => (
                    <figure key={image.id} className="overflow-hidden rounded border border-slate-200">
                      <img src={image.url} alt={image.name} className="h-28 w-full object-cover" />
                      <figcaption className="space-y-1 px-2 py-1">
                        <p className="truncate text-xs text-slate-500">{image.name}</p>
                        <p className="w-fit rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {image.type}
                        </p>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <ImageIcon size={16} />
                  No images
                </div>
              )}
            </motion.article>
          ))}
        </div>
      )}
    </motion.section>
  );
}
