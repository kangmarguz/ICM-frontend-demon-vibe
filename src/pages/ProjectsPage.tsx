import { ImageIcon, Plus, UploadCloud, X } from 'lucide-react';
import { ChangeEvent, DragEvent, FormEvent, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getVisibleProjects, useProjectStore } from '../stores/projectStore';
import type { ProjectStatus } from '../types/project';

type PendingImage = {
  id: string;
  file: File;
  previewUrl: string;
};

const projectStatuses: ProjectStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export function ProjectsPage() {
  const user = useAuthStore((state) => state.user)!;
  const allProjects = useProjectStore((state) => state.projects);
  const createProject = useProjectStore((state) => state.createProject);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('PENDING');
  const [isActive, setIsActive] = useState(true);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const projects = useMemo(() => getVisibleProjects(allProjects, user), [allProjects, user]);

  const canCreate = user.role === 'USER' || user.role === 'ADMIN';
  const helperText = useMemo(() => {
    if (user.role === 'ADMIN') {
      return 'ADMIN can create and manage projects. Backend API integration can replace this local store later.';
    }

    if (user.role === 'GUEST') {
      return 'GUEST can view assigned projects only.';
    }

    return 'USER can create and manage only their own projects.';
  }, [user.role]);

  const addFiles = (fileList: FileList | File[]) => {
    const imageFiles = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    const nextImages = imageFiles.map((file) => ({
      id: crypto.randomUUID(),
      file: file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPendingImages((current) => [...current, ...nextImages]);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addFiles(event.target.files);
      event.target.value = '';
    }
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (!canCreate) {
      return;
    }

    addFiles(event.dataTransfer.files);
  };

  const removePendingImage = (imageId: string) => {
    setPendingImages((current) => {
      const image = current.find((item) => item.id === imageId);

      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }

      return current.filter((item) => item.id !== imageId);
    });
  };

  const clearForm = () => {
    pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    setTitle('');
    setDescription('');
    setStatus('PENDING');
    setIsActive(true);
    setPendingImages([]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canCreate || !title.trim()) {
      return;
    }

    createProject({
      title: title.trim(),
      description: description.trim(),
      status: status,
      isActive: isActive,
      createdById: user.id,
      images: pendingImages.map((image) => ({
        name: image.file.name,
        url: image.previewUrl,
        publicId: null,
      })),
    });
    clearForm();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-950">Add project</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{helperText}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={!canCreate}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
              placeholder="Project title"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={!canCreate}
              className="mt-1 min-h-24 w-full resize-none rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
              placeholder="Short project detail"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as ProjectStatus)}
                disabled={!canCreate}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
              >
                {projectStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 rounded border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                disabled={!canCreate}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              Active
            </label>
          </div>

          <div>
            <span className="text-sm font-medium text-slate-700">Images</span>
            <button
              type="button"
              disabled={!canCreate}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={[
                'mt-1 flex min-h-36 w-full flex-col items-center justify-center rounded border border-dashed px-4 py-6 text-center transition',
                isDragging ? 'border-sky-500 bg-sky-50' : 'border-slate-300 bg-slate-50 hover:border-sky-400 hover:bg-sky-50',
                !canCreate ? 'cursor-not-allowed opacity-60' : '',
              ].join(' ')}
            >
              <UploadCloud size={28} className="text-sky-600" />
              <span className="mt-2 text-sm font-medium text-slate-800">Drop images here or click to browse</span>
              <span className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP files are accepted</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {pendingImages.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {pendingImages.map((image) => (
                <div key={image.id} className="group relative overflow-hidden rounded border border-slate-200">
                  <img src={image.previewUrl} alt={image.file.name} className="h-24 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePendingImage(image.id)}
                    className="absolute right-1 top-1 rounded bg-white/90 p-1 text-slate-700 shadow-sm hover:bg-white"
                    aria-label={`Remove ${image.file.name}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canCreate}
            className="flex w-full items-center justify-center gap-2 rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Plus size={16} />
            Create project
          </button>
        </form>
      </section>

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
                        <figcaption className="truncate px-2 py-1 text-xs text-slate-500">{image.name}</figcaption>
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
    </div>
  );
}
