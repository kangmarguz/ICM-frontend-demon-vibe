import { ImageIcon } from 'lucide-react';
import type { Project } from '../../types/project';

type ProjectListProps = {
  projects: Project[];
};

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-950">Projects</h2>
        <p className="text-sm text-slate-500">Project list is filtered by the current role.</p>
      </div>

      {projects.length === 0 ? (
        <div className="px-6 py-10 text-sm text-slate-500">No projects yet.</div>
      ) : (
        <div className="divide-y divide-slate-200">
          {projects.map((project) => (
            <article key={project.id} className="px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-950">{project.title}</h3>
                  {project.description ? (
                    <p className="mt-1 text-sm leading-6 text-slate-500">{project.description}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-sky-50 px-3 py-1 text-xs font-semibold uppercase text-sky-700">
                    {project.status}
                  </span>
                  <span className="rounded bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                    {project.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
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
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
