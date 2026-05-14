import { Box, ImageIcon, Plus, ReceiptText, UploadCloud, X } from 'lucide-react';
import { ChangeEvent, DragEvent, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../stores/authStore';
import { getVisibleProjects, useProjectStore } from '../stores/projectStore';
import type { ImageType, ProjectStatus } from '../types/project';

type PendingImage = {
  id: string;
  file: File;
  previewUrl: string;
};

const projectStatuses: ProjectStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const projectSchema = z.object({
  title: z.string().trim().min(1, 'Project title is required'),
  description: z.string().trim().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  isActive: z.boolean(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const imageFields: Array<{
  type: ImageType;
  title: string;
  description: string;
  icon: typeof ImageIcon;
}> = [
  {
    type: 'IMAGE_2D',
    title: '2D images',
    description: 'Upload plan, drawing, or flat reference images.',
    icon: ImageIcon,
  },
  {
    type: 'IMAGE_3D',
    title: '3D images',
    description: 'Upload 3D preview, render, or model reference images.',
    icon: Box,
  },
  {
    type: 'PAY_SLIP',
    title: 'Pay slip',
    description: 'Upload payment slip or payment evidence.',
    icon: ReceiptText,
  },
];

export function ProjectsPage() {
  const user = useAuthStore((state) => state.user)!;
  const allProjects = useProjectStore((state) => state.projects);
  const createProject = useProjectStore((state) => state.createProject);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'PENDING',
      isActive: true,
    },
  });
  const [pendingImages, setPendingImages] = useState<Record<ImageType, PendingImage[]>>({
    IMAGE_2D: [],
    IMAGE_3D: [],
    PAY_SLIP: [],
  });
  const [draggingField, setDraggingField] = useState<ImageType | null>(null);
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

  const addFiles = (type: ImageType, fileList: FileList | File[]) => {
    const imageFiles = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    const nextImages: PendingImage[] = imageFiles.map((file) => ({
      id: crypto.randomUUID(),
      file: file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPendingImages((current) => ({
      ...current,
      [type]: [...current[type], ...nextImages],
    }));
  };

  const handleFileChange = (type: ImageType, event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addFiles(type, event.target.files);
      event.target.value = '';
    }
  };

  const handleDrop = (type: ImageType, event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDraggingField(null);

    if (!canCreate) {
      return;
    }

    addFiles(type, event.dataTransfer.files);
  };

  const removePendingImage = (type: ImageType, imageId: string) => {
    setPendingImages((current) => {
      const image = current[type].find((item) => item.id === imageId);

      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }

      return {
        ...current,
        [type]: current[type].filter((item) => item.id !== imageId),
      };
    });
  };

  const clearForm = () => {
    Object.values(pendingImages).forEach((images) => {
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    });
    reset({
      title: '',
      description: '',
      status: 'PENDING',
      isActive: true,
    });
    setPendingImages({
      IMAGE_2D: [],
      IMAGE_3D: [],
      PAY_SLIP: [],
    });
  };

  const onSubmit = (data: ProjectFormData) => {
    if (!canCreate) {
      return;
    }

    createProject({
      title: data.title,
      description: data.description ?? '',
      status: data.status,
      isActive: data.isActive,
      createdById: user.id,
      images: imageFields.flatMap((field) =>
        pendingImages[field.type].map((image) => ({
          name: image.file.name,
          url: image.previewUrl,
          publicId: null,
          type: field.type,
        })),
      ),
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Title</span>
            <input
              {...register('title')}
              disabled={!canCreate}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
              placeholder="Project title"
            />
            {errors.title ? <p className="mt-1 text-sm text-rose-600">{errors.title.message}</p> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
              {...register('description')}
              disabled={!canCreate}
              className="mt-1 min-h-24 w-full resize-none rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
              placeholder="Short project detail"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                {...register('status')}
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
                {...register('isActive')}
                disabled={!canCreate}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              Active
            </label>
          </div>

          <div className="space-y-4">
            <span className="text-sm font-medium text-slate-700">Project files</span>
            {imageFields.map((field) => {
              const FieldIcon = field.icon;
              const images = pendingImages[field.type];
              const isCurrentDragging = draggingField === field.type;

              return (
                <div key={field.type} className="rounded border border-slate-200 p-3">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded bg-sky-50 text-sky-700">
                      <FieldIcon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{field.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{field.description}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!canCreate}
                    onClick={() => {
                      fileInputRef.current?.setAttribute('data-image-type', field.type);
                      fileInputRef.current?.click();
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDraggingField(field.type);
                    }}
                    onDragLeave={() => setDraggingField(null)}
                    onDrop={(event) => handleDrop(field.type, event)}
                    className={[
                      'flex min-h-28 w-full flex-col items-center justify-center rounded border border-dashed px-4 py-5 text-center transition',
                      isCurrentDragging
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-slate-300 bg-slate-50 hover:border-sky-400 hover:bg-sky-50',
                      !canCreate ? 'cursor-not-allowed opacity-60' : '',
                    ].join(' ')}
                  >
                    <UploadCloud size={24} className="text-sky-600" />
                    <span className="mt-2 text-sm font-medium text-slate-800">Drop files here or click to browse</span>
                    <span className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP files are accepted</span>
                  </button>

                  {images.length > 0 ? (
                    <div className="mt-3 grid gap-3">
                      {images.map((image) => (
                        <div
                          key={image.id}
                          className="grid gap-3 rounded border border-slate-200 p-2 sm:grid-cols-[88px_1fr_auto] sm:items-center"
                        >
                          <img src={image.previewUrl} alt={image.file.name} className="h-22 w-full rounded object-cover sm:h-20 sm:w-22" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{image.file.name}</p>
                            <p className="mt-1 w-fit rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                              {field.type}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePendingImage(field.type, image.id)}
                            className="flex h-9 w-9 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            aria-label={`Remove ${image.file.name}`}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                const type = event.currentTarget.getAttribute('data-image-type') as ImageType | null;

                if (type) {
                  handleFileChange(type, event);
                }
              }}
            />
          </div>

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
    </div>
  );
}
