import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import type { ChangeEvent, DragEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import type { EditProjectFormData } from '../components/projects/detail/ProjectEditForm';
import { imageFields, type PendingImage } from '../components/projects/projectFormSchema';
import { resizeImageToBase64 } from '../lib/resizeImageToBase64';
import { getProjectById, updateProject } from '../services/projectApi';
import { deleteFromCloudinary, uploadToCloudinary } from '../services/uploadApi';
import { useAuthStore } from '../stores/authStore';
import { useProjectStore } from '../stores/projectStore';
import type { ImageType, Project, ProjectImage } from '../types/project';

const editProjectSchema = z.object({
  title: z.string().trim().min(1, 'Project title is required'),
  description: z.string().trim().optional(),
  urlLink: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || z.string().url().safeParse(value).success, {
      message: 'URL link must be a valid URL',
    })
    .optional(),
  status: z.enum(['PENDING', 'PROGRESS', 'COMPLETED', 'CANCELLED']),
  isActive: z.boolean(),
});

type ApiErrorResponse = {
  message?: string;
};

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiErrorResponse | undefined)?.message ?? fallback;
  }

  return fallback;
}

function getProjectFormValues(project: Project): EditProjectFormData {
  return {
    title: project.title,
    description: project.description ?? '',
    urlLink: project.urlLink ?? '',
    status: project.status,
    isActive: project.isActive,
  };
}

const emptyPendingImages: Record<ImageType, PendingImage[]> = {
  IMAGE_2D: [],
  IMAGE_3D: [],
  PAY_SLIP: [],
};

const toImagePayload = (image: ProjectImage) => ({
  name: image.name,
  url: image.url,
  publicId: image.publicId ?? null,
  type: image.type,
});

export function useProjectDetailController() {
  const { projectId } = useParams();
  const user = useAuthStore((state) => state.user)!;
  const actionUpdateProject = useProjectStore((state) => state.actionUpdateProject);
  const cachedProject = useProjectStore((state) => state.projects.find((project) => project.id === projectId));
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const [isEditing, setIsEditing] = useState(false);
  const [pendingImages, setPendingImages] = useState<Record<ImageType, PendingImage[]>>(emptyPendingImages);
  const canEdit = user.role === 'ADMIN' || project?.createdById === user.id;
  const showProjectControls = user.role !== 'USER';
  const showActiveState = user.role !== 'USER';

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
      urlLink: '',
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
          reset(getProjectFormValues(nextProject));
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(getApiErrorMessage(error, 'Cannot load project.'));
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
    if (project) {
      reset(getProjectFormValues(project));
    }
  }, [project, reset]);

  const groupedImages = useMemo(() => {
    const images = project?.images ?? [];

    return {
      IMAGE_2D: images.filter((image) => image.type === 'IMAGE_2D'),
      IMAGE_3D: images.filter((image) => image.type === 'IMAGE_3D'),
      PAY_SLIP: images.filter((image) => image.type === 'PAY_SLIP'),
    };
  }, [project]);

  const clearPendingImages = () => {
    Object.values(pendingImages).forEach((images) => {
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    });
    setPendingImages(emptyPendingImages);
  };

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

    if (canEdit) {
      addFiles(type, event.dataTransfer.files);
    }
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

  const handleStartEditing = () => {
    setSaveError('');
    setSaveSuccess('');
    setImageError('');
    setImageSuccess('');
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    if (project) {
      reset(getProjectFormValues(project));
    }

    clearPendingImages();
    setSaveError('');
    setSaveSuccess('');
    setImageError('');
    setImageSuccess('');
    setIsEditing(false);
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
        urlLink: data.urlLink ?? '',
        ...(showProjectControls ? { status: data.status, isActive: data.isActive } : {}),
      });

      setProject(updatedProject);
      actionUpdateProject(updatedProject);
      setSaveSuccess('Project updated.');
      setIsEditing(false);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, 'Cannot update project.'));
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

      const uploadedTypes = new Set(uploadedImages.map((image) => image.type));
      const imagesForUpdate = [
        ...project.images
          .filter((image) => {
            if (!uploadedTypes.has(image.type)) {
              return false;
            }

            return image.type !== 'PAY_SLIP';
          })
          .map(toImagePayload),
        ...uploadedImages,
      ];

      const updatedProject = await updateProject(projectId, {
        title: project.title,
        description: project.description ?? '',
        urlLink: project.urlLink ?? '',
        images: imagesForUpdate,
        ...(showProjectControls ? { status: project.status, isActive: project.isActive } : {}),
      });

      setProject(updatedProject);
      actionUpdateProject(updatedProject);
      clearPendingImages();
      setImageSuccess('Images uploaded.');
    } catch (error) {
      setImageError(getApiErrorMessage(error, 'Cannot upload images.'));
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
      setImageError(getApiErrorMessage(error, 'Cannot delete image.'));
    } finally {
      setDeletingPublicId(null);
    }
  };

  return {
    canEdit,
    deletingPublicId,
    draggingField,
    errors,
    fileInputRef,
    groupedImages,
    handleBrowse,
    handleCancelEditing,
    handleDeleteImage,
    handleDrop,
    handleFileChange,
    handleStartEditing,
    handleSubmit,
    handleUploadImages,
    imageError,
    imageSuccess,
    isEditing,
    isLoading,
    isSubmitting,
    isUploadingImages,
    loadError,
    pendingImages,
    project,
    register,
    removePendingImage,
    saveError,
    saveSuccess,
    setDraggingField,
    showActiveState,
    showProjectControls,
    submitProject: onSubmit,
  };
}
