import { apiClient } from '../lib/apiClient';
import type { Site } from '../types/site';

export type SaveSiteRequest = {
  name: string;
  description?: string | null;
  isActive: boolean;
};

type SitesResponse =
  | Site[]
  | {
      sites?: Site[];
      data?: Site[] | { sites?: Site[] };
    };

type SiteResponse =
  | Site
  | {
      site?: Site;
      data?: Site | { site?: Site };
    };

function normalizeSitesResponse(response: SitesResponse) {
  if (Array.isArray(response)) {
    return response;
  }

  if (response.sites) {
    return response.sites;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data?.sites ?? [];
}

function normalizeSiteResponse(response: SiteResponse) {
  if ('id' in response) {
    return response;
  }

  if (response.site) {
    return response.site;
  }

  if (response.data && 'id' in response.data) {
    return response.data;
  }

  return response.data?.site;
}

export async function fetchSites() {
  const response = await apiClient.get<SitesResponse>('/sites');
  return normalizeSitesResponse(response.data);
}

export async function createSite(payload: SaveSiteRequest) {
  const response = await apiClient.post<SiteResponse>('/sites', payload);
  return normalizeSiteResponse(response.data);
}

export async function updateSite(siteId: string, payload: Partial<SaveSiteRequest>) {
  const response = await apiClient.patch<SiteResponse>(`/sites/${siteId}`, payload);
  return normalizeSiteResponse(response.data);
}
