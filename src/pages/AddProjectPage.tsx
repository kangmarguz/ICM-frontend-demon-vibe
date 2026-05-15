import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProjectForm } from '../components/projects/ProjectForm';
import type { CreateProjectFormPayload } from '../components/projects/projectFormSchema';
import { resizeImageToBase64 } from '../lib/resizeImageToBase64';
import { getApiErrorMessage, toastAsync } from '../lib/toast';
import { fetchSites } from '../services/siteApi';
import { createProject as createProjectApi } from '../services/projectApi';
import { uploadToCloudinary } from '../services/uploadApi';
import { useAuthStore } from '../stores/authStore';
import { useProjectStore } from '../stores/projectStore';
import type { Project } from '../types/project';
import type { Site } from '../types/site';

export function AddProjectPage() {
  const user = useAuthStore((state) => state.user)!;
  const actionAddProject = useProjectStore((state) => state.actionAddProject);
  const navigate = useNavigate();
  const [createError, setCreateError] = useState('');
  const [sites, setSites] = useState<Site[]>([]);

  const canCreate = user.role === 'USER' || user.role === 'ADMIN';
  const helperText = useMemo(() => {
    if (user.role === 'ADMIN') {
      return 'Create a project with separate 2D, 3D, and payment slip uploads.';
    }

    if (user.role === 'GUEST') {
      return 'GUEST can view assigned projects only.';
    }

    return 'Create a project under your account.';
  }, [user.role]);

  useEffect(() => {
    let isMounted = true;

    async function loadSites() {
      if (user.role !== 'ADMIN') {
        return;
      }

      try {
        const loadedSites = await fetchSites();

        if (isMounted) {
          setSites(loadedSites.filter((site) => site.isActive));
        }
      } catch {
        if (isMounted) {
          setCreateError('Cannot load sites.');
        }
      }
    }

    loadSites();

    return () => {
      isMounted = false;
    };
  }, [user.role]);

  const handleCreateProject = async (payload: CreateProjectFormPayload) => {
    try {
      setCreateError('');
      const createdProject = await toastAsync(
        async () => {
          const uploadedImages = await Promise.all(
            payload.images.map(async (image) => {
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

          return createProjectApi({
            title: payload.title,
            description: payload.description,
            urlLink: payload.urlLink,
            siteId: payload.siteId,
            status: payload.status,
            isActive: payload.isActive,
            images: uploadedImages,
          });
        },
        {
          pending: 'Creating project...',
          success: 'Project created successfully.',
          error: 'Cannot create project. Please check project data and uploaded files.',
        },
      );

      actionAddProject(normalizeProjectForClient(createdProject, user.id));
      navigate('/projects', { replace: true });
    } catch (error) {
      setCreateError(getApiErrorMessage(error, 'Cannot create project. Please check project data and uploaded files.'));
      throw error;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mx-auto max-w-3xl space-y-5"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.3, ease: 'easeOut' }}
        className="flex items-center justify-between gap-4"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Projects</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Add project</h2>
        </div>
        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }}>
          <Link
            to="/projects"
            className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </motion.div>
      </motion.div>

      <ProjectForm
        canCreate={canCreate}
        sites={sites}
        errorMessage={createError}
        helperText={helperText}
        onCreate={handleCreateProject}
        showSiteControl={user.role === 'ADMIN'}
        showProjectControls={user.role !== 'USER'}
      />
    </motion.div>
  );
}

function normalizeProjectForClient(project: Project, fallbackUserId: string): Project {
  const now = new Date().toISOString();

  return {
    ...project,
    description: project.description ?? null,
    urlLink: project.urlLink ?? null,
    createdAt: project.createdAt ?? now,
    updatedAt: project.updatedAt ?? now,
    createdById: project.createdById ?? fallbackUserId,
    images: project.images ?? [],
  };
}
