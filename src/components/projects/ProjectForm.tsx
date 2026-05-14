import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import type { ChangeEvent, DragEvent } from 'react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { ImageType } from '../../types/project';
import { ProjectFileField } from './ProjectFileField';
import {
  type CreateProjectFormPayload,
  type PendingImage,
  type ProjectFormData,
  imageFields,
  projectSchema,
  projectStatuses,
} from './projectFormSchema';

type ProjectFormProps = {
  canCreate: boolean;
  errorMessage?: string;
  helperText: string;
  onCreate: (payload: CreateProjectFormPayload) => Promise<void> | void;
  showProjectControls?: boolean;
};

const emptyPendingImages: Record<ImageType, PendingImage[]> = {
  IMAGE_2D: [],
  IMAGE_3D: [],
  PAY_SLIP: [],
};

export function ProjectForm({ canCreate, errorMessage, helperText, onCreate, showProjectControls = true }: ProjectFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'PENDING',
      isActive: true,
    },
  });
  const [pendingImages, setPendingImages] = useState<Record<ImageType, PendingImage[]>>(emptyPendingImages);
  const [draggingField, setDraggingField] = useState<ImageType | null>(null);

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

  const onSubmit = async (data: ProjectFormData) => {
    if (!canCreate) {
      return;
    }

    await onCreate({
      title: data.title,
      description: data.description ?? '',
      status: data.status,
      isActive: data.isActive,
      images: imageFields.flatMap((field) =>
        pendingImages[field.type].map((image) => ({
          name: image.file.name,
          file: image.file,
          type: field.type,
        })),
      ),
    });
    clearForm();
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -2, boxShadow: '0 12px 30px rgb(15 23 42 / 0.08)' }}
      className="rounded-lg border border-slate-200 bg-white p-5"
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">Add project</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{helperText}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            {...register('title')}
            disabled={!canCreate || isSubmitting}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
            placeholder="Project title"
          />
          {errors.title ? <p className="mt-1 text-sm text-rose-600">{errors.title.message}</p> : null}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            {...register('description')}
            disabled={!canCreate || isSubmitting}
            className="mt-1 min-h-24 w-full resize-none rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-slate-100"
            placeholder="Short project detail"
          />
        </label>

        {showProjectControls ? (
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                {...register('status')}
                disabled={!canCreate || isSubmitting}
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
                disabled={!canCreate || isSubmitting}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              Active
            </label>
          </div>
        ) : null}

        <div className="space-y-4">
          <span className="text-sm font-medium text-slate-700">Project files</span>
          {imageFields.map((field) => (
            <ProjectFileField
              key={field.type}
              canCreate={canCreate}
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
        </div>

        <motion.button
          type="submit"
          disabled={!canCreate || isSubmitting}
          whileHover={!canCreate || isSubmitting ? undefined : { y: -1 }}
          whileTap={!canCreate || isSubmitting ? undefined : { scale: 0.99 }}
          className="flex w-full items-center justify-center gap-2 rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-sky-100 hover:bg-sky-700 hover:shadow-md hover:shadow-sky-100 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Plus size={16} />
          {isSubmitting ? 'Creating project...' : 'Create project'}
        </motion.button>

        {errorMessage ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {errorMessage}
          </motion.div>
        ) : null}
      </form>
    </motion.section>
  );
}
