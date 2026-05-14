import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { ArrowLeft, ImageIcon, Save, Trash2, UploadCloud } from 'lucide-react';
import { motion } from 'motion/react';
import type { ChangeEvent, DragEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { z } from 'zod';
import { ProjectFileField } from '../components/projects/ProjectFileField';
import { imageFields, type PendingImage, projectStatuses } from '../components/projects/projectFormSchema';
import { resizeImageToBase64 } from '../lib/resizeImageToBase64';
import { getProjectById, updateProject } from '../services/projectApi';
import { deleteFromCloudinary, uploadToCloudinary } from '../services/uploadApi';
import { useAuthStore } from '../stores/authStore';
import { useProjectStore } from '../stores/projectStore';
import type { ImageType, Project } from '../types/project';

const editProjectSchema = z.object({
  title: z.string().trim().min(1, 'Project title is required'),
  description: z.string().trim().optional(),
  status: z.enum(['PENDING', 'PROGRESS', 'COMPLETED', 'CANCELLED']),
  isActive: z.boolean(),
});

type EditProjectFormData = z.infer<typeof editProjectSchema>;

type ApiErrorResponse = {
  message?: string;
};

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const user = useAuthStore((state) => state.user)!;
  const actionUpdateProject = useProjectStore((state) => state.actionUpdateProject);
  const cachedProject = useProjectStore((state) => state.projects.find((project) => project.id === projectId));
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [project, setProject] = useState<Project | null>(cachedProject ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [imageError, setImageError] = useState('');
  const [imageSuccess, setImageSuccess] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [deletingPublicId, setDeletingPublicId] = useState<string | null>(null);
  const [draggingField, setDraggingField] = useState<ImageType | null>(null);
  const [pendingImages, setPendingImages] = useState<Record<ImageType, PendingImage[]>>({
    IMAGE_2D: [],
    IMAGE_3D: [],
    PAY_SLIP: [],
  });
  const canEdit = user.role === 'ADMIN' || project?.createdById === user.id;
  const showProjectControls = user.role !== 'USER';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'PENDING',
      isActive: true,
    },
  });

  useEffect(() => {
    let isMounted = true;

    const fetchProject = async () => {
      if (!projectId) {
        return;
      }

      try {
        setIsLoading(true);
        setLoadError('');
        const nextProject = await getProjectById(projectId);

        if (isMounted) {
          setProject(nextProject);
          actionUpdateProject(nextProject);
          reset({
            title: nextProject.title,
            description: nextProject.description ?? '',
            status: nextProject.status,
            isActive: nextProject.isActive,
          });
        }
      } catch (error) {
        const message =
          error instanceof AxiosError
            ? (error.response?.data as ApiErrorResponse | undefined)?.message
            : undefined;

        if (isMounted) {
          setLoadError(message ?? 'Cannot load project.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProject();

    return () => {
      isMounted = false;
    };
  }, [actionUpdateProject, projectId, reset]);

  useEffect(() => {
    if (!project) {
      return;
    }

    reset({
      title: project.title,
      description: project.description ?? '',
      status: project.status,
      isActive: project.isActive,
    });
  }, [project, reset]);

  const groupedImages = useMemo(() => {
    const images = project?.images ?? [];

    return {
      IMAGE_2D: images.filter((image) => image.type === 'IMAGE_2D'),
      IMAGE_3D: images.filter((image) => image.type === 'IMAGE_3D'),
      PAY_SLIP: images.filter((image) => image.type === 'PAY_SLIP'),
    };
  }, [project]);

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

  const handleBrowse = (type: ImageType) => {
    fileInputRef.current?.setAttribute('data-image-type', type);
    fileInputRef.current?.click();
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

    if (!canEdit) {
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

  const clearPendingImages = () => {
    Object.values(pendingImages).forEach((images) => {
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    });
    setPendingImages({
      IMAGE_2D: [],
      IMAGE_3D: [],
      PAY_SLIP: [],
    });
  };

  const onSubmit = async (data: EditProjectFormData) => {
    if (!projectId || !canEdit) {
      return;
    }

    try {
      setSaveError('');
      setSaveSuccess('');
      const updatedProject = await updateProject(projectId, {
        title: data.title,
        description: data.description ?? '',
        status: showProjectControls ? data.status : 'PENDING',
        isActive: showProjectControls ? data.isActive : true,
      });

      setProject(updatedProject);
      actionUpdateProject(updatedProject);
      setSaveSuccess('Project updated.');
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as ApiErrorResponse | undefined)?.message
          : undefined;

      setSaveError(message ?? 'Cannot update project.');
      throw error;
    }
  };

  const handleUploadImages = async () => {
    if (!projectId || !project || !canEdit) {
      return;
    }

    const imagesToUpload = imageFields.flatMap((field) =>
      pendingImages[field.type].map((image) => ({
        file: image.file,
        name: image.file.name,
        type: field.type,
      })),
    );

    if (imagesToUpload.length === 0) {
      return;
    }

    try {
      setImageError('');
      setImageSuccess('');
      setIsUploadingImages(true);

      const uploadedImages = await Promise.all(
        imagesToUpload.map(async (image) => {
          const base64 = await resizeImageToBase64(image.file);
          const uploadedImage = await uploadToCloudinary({
            name: image.name,
            file: base64,
            type: image.type,
          });

          return {
            name: uploadedImage.name,
            url: uploadedImage.url,
            publicId: uploadedImage.publicId ?? null,
            type: image.type,
          };
        }),
      );

      const updatedProject = await updateProject(projectId, {
        title: project.title,
        description: project.description ?? '',
        status: showProjectControls ? project.status : 'PENDING',
        isActive: showProjectControls ? project.isActive : true,
        images: uploadedImages,
      });

      setProject(updatedProject);
      actionUpdateProject(updatedProject);
      clearPendingImages();
      setImageSuccess('Images uploaded.');
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as ApiErrorResponse | undefined)?.message
          : undefined;

      setImageError(message ?? 'Cannot upload images.');
      throw error;
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleDeleteImage = async (publicId: string | null | undefined) => {
    if (!project || !publicId || !canEdit) {
      return;
    }

    try {
      setImageError('');
      setImageSuccess('');
      setDeletingPublicId(publicId);
      await deleteFromCloudinary(publicId);

      const updatedProject = {
        ...project,
        images: project.images.filter((image) => image.publicId !== publicId),
      };

      setProject(updatedProject);
      actionUpdateProject(updatedProject);
      setImageSuccess('Image deleted.');
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as ApiErrorResponse | undefined)?.message
          : undefined;

      setImageError(message ?? 'Cannot delete image.');
    } finally {
      setDeletingPublicId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mx-auto max-w-5xl space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Projects</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Project detail</h2>
          <p className="mt-1 text-sm text-slate-500">View and edit project information.</p>
        </div>
        <Link
          to="/projects"
          className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">Loading project...</div>
      ) : loadError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700">{loadError}</div>
      ) : project ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.3, ease: 'easeOut' }}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Title</span>
                <input
                  {...register('title')}
                  disabled={!canEdit || isSubmitting}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
                />
                {errors.title ? <p className="mt-1 text-sm text-rose-600">{errors.title.message}</p> : null}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Description</span>
                <textarea
                  {...register('description')}
                  disabled={!canEdit || isSubmitting}
                  className="mt-1 min-h-32 w-full resize-none rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
                />
              </label>

              {showProjectControls ? (
                <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Status</span>
                    <select
                      {...register('status')}
                      disabled={!canEdit || isSubmitting}
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
                    >
                      {projectStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-center gap-2 rounded border border-slate-200 px-3 py-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      {...register('isActive')}
                      disabled={!canEdit || isSubmitting}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    Active
                  </label>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  type="submit"
                  disabled={!canEdit || isSubmitting}
                  whileHover={!canEdit || isSubmitting ? undefined : { y: -1 }}
                  whileTap={!canEdit || isSubmitting ? undefined : { scale: 0.99 }}
                  className="flex items-center gap-2 rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Save size={16} />
                  {isSubmitting ? 'Saving...' : 'Save changes'}
                </motion.button>
                {!canEdit ? <p className="text-sm text-slate-500">You can view this project but cannot edit it.</p> : null}
              </div>

              {saveError ? <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{saveError}</div> : null}
              {saveSuccess ? <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{saveSuccess}</div> : null}
            </form>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.3, ease: 'easeOut' }}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <h3 className="font-semibold text-slate-950">Project images</h3>
            <p className="mt-1 text-sm text-slate-500">Images are grouped by backend image type.</p>

            <div className="mt-4 space-y-5">
              {Object.entries(groupedImages).map(([type, images]) => (
                <div key={type}>
                  <p className="mb-2 text-xs font-semibold uppercase text-slate-500">{type}</p>
                  {images.length === 0 ? (
                    <div className="flex items-center gap-2 rounded border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">
                      <ImageIcon size={16} />
                      No images
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {images.map((image) => (
                        <figure key={image.id} className="overflow-hidden rounded border border-slate-200">
                          <img src={image.url} alt={image.name} className="h-28 w-full object-cover" />
                          <figcaption className="space-y-2 px-2 py-2">
                            <p className="truncate text-xs text-slate-500">{image.name}</p>
                            {canEdit && image.publicId ? (
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(image.publicId)}
                                disabled={deletingPublicId === image.publicId}
                                className="flex w-full items-center justify-center gap-1 rounded border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Trash2 size={13} />
                                {deletingPublicId === image.publicId ? 'Deleting...' : 'Delete'}
                              </button>
                            ) : null}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {canEdit ? (
              <div className="mt-6 border-t border-slate-200 pt-5">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-slate-950">Add images</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Upload new images to Cloudinary and save them to this project.</p>
                </div>

                <div className="space-y-3">
                  {imageFields.map((field) => (
                    <ProjectFileField
                      key={field.type}
                      canCreate={canEdit && !isUploadingImages}
                      draggingField={draggingField}
                      field={field}
                      images={pendingImages[field.type]}
                      onBrowse={handleBrowse}
                      onDragLeave={() => setDraggingField(null)}
                      onDragOver={setDraggingField}
                      onDrop={handleDrop}
                      onRemove={removePendingImage}
                    />
                  ))}

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

                  <motion.button
                    type="button"
                    onClick={handleUploadImages}
                    disabled={isUploadingImages}
                    whileHover={isUploadingImages ? undefined : { y: -1 }}
                    whileTap={isUploadingImages ? undefined : { scale: 0.99 }}
                    className="flex w-full items-center justify-center gap-2 rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <UploadCloud size={16} />
                    {isUploadingImages ? 'Uploading...' : 'Upload images'}
                  </motion.button>

                  {imageError ? <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{imageError}</div> : null}
                  {imageSuccess ? <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{imageSuccess}</div> : null}
                </div>
              </div>
            ) : null}
          </motion.aside>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">Project not found.</div>
      )}
    </motion.div>
  );
}
