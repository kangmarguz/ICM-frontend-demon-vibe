import { apiClient } from '../lib/apiClient';
import type { Category } from '../types/category';

export type SaveCategoryRequest = {
  name: string;
  description?: string | null;
  isActive: boolean;
};

type CategoriesResponse =
  | Category[]
  | {
      categories?: Category[];
      data?: Category[] | { categories?: Category[] };
    };

type CategoryResponse =
  | Category
  | {
      category?: Category;
      data?: Category | { category?: Category };
    };

function normalizeCategoriesResponse(response: CategoriesResponse) {
  if (Array.isArray(response)) {
    return response;
  }

  if (response.categories) {
    return response.categories;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data?.categories ?? [];
}

function normalizeCategoryResponse(response: CategoryResponse) {
  if ('id' in response) {
    return response;
  }

  if (response.category) {
    return response.category;
  }

  if (response.data && 'id' in response.data) {
    return response.data;
  }

  return response.data?.category;
}

export async function fetchCategories() {
  const response = await apiClient.get<CategoriesResponse>('/categories');
  return normalizeCategoriesResponse(response.data);
}

export async function createCategory(payload: SaveCategoryRequest) {
  const response = await apiClient.post<CategoryResponse>('/categories', payload);
  return normalizeCategoryResponse(response.data);
}

export async function updateCategory(categoryId: string, payload: Partial<SaveCategoryRequest>) {
  const response = await apiClient.patch<CategoryResponse>(`/categories/${categoryId}`, payload);
  return normalizeCategoryResponse(response.data);
}
