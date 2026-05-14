import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { getProjects, getProjectsByUserId } from '../services/projectApi';
import { useProjectStore } from '../stores/projectStore';
import type { AppUser } from '../types/auth';

type ApiErrorResponse = {
  message?: string;
};

export function useLoadProjects(user: AppUser) {
  const actionSetProjects = useProjectStore((state) => state.actionSetProjects);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [loadProjectsError, setLoadProjectsError] = useState('');

  const loadProjects = useCallback(async () => {
    try {
      setIsLoadingProjects(true);
      setLoadProjectsError('');
      const projects = user.role === 'ADMIN' ? await getProjects() : await getProjectsByUserId(user.id);
      actionSetProjects(projects);
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as ApiErrorResponse | undefined)?.message
          : undefined;

      setLoadProjectsError(message ?? 'Cannot load projects.');
    } finally {
      setIsLoadingProjects(false);
    }
  }, [actionSetProjects, user.id, user.role]);

  return {
    isLoadingProjects,
    loadProjects,
    loadProjectsError,
  };
}
