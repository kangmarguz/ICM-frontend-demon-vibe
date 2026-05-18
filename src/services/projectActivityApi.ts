import { apiClient } from '../lib/apiClient';
import type { ProjectActivity } from '../types/activity';

type ActivitiesResponse =
  | ProjectActivity[]
  | {
      activities?: ProjectActivity[];
      data?: ProjectActivity[] | { activities?: ProjectActivity[] };
    };

type ActivityResponse =
  | ProjectActivity
  | {
      activity?: ProjectActivity;
      data?: ProjectActivity | { activity?: ProjectActivity };
    };

function normalizeActivitiesResponse(response: ActivitiesResponse) {
  if (Array.isArray(response)) {
    return response;
  }

  if (response.activities) {
    return response.activities;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data?.activities ?? [];
}

function normalizeActivityResponse(response: ActivityResponse) {
  if ('id' in response) {
    return response;
  }

  if (response.activity) {
    return response.activity;
  }

  if (response.data && 'id' in response.data) {
    return response.data;
  }

  return response.data?.activity;
}

export async function fetchProjectActivities(projectId: string) {
  const response = await apiClient.get<ActivitiesResponse>(`/projects/${projectId}/activity`);
  return normalizeActivitiesResponse(response.data);
}

export async function createProjectComment(projectId: string, message: string) {
  const response = await apiClient.post<ActivityResponse>(`/projects/${projectId}/comments`, { message });
  return normalizeActivityResponse(response.data);
}
