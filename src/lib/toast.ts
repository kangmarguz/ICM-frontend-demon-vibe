import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

type ApiErrorResponse = {
  message?: string;
  status?: {
    message?: string;
  };
};

type AsyncToastMessages<T> = {
  pending: string;
  success: string | ((result: T) => string);
  error: string | ((message: string) => string);
};

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;

    return data?.message ?? data?.status?.message ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function toastAsync<T>(operation: () => Promise<T>, messages: AsyncToastMessages<T>) {
  const toastId = toast.loading(messages.pending);

  try {
    const result = await operation();
    const successMessage = typeof messages.success === 'function' ? messages.success(result) : messages.success;

    toast.update(toastId, {
      render: successMessage,
      type: 'success',
      isLoading: false,
      autoClose: 3000,
      closeButton: true,
    });

    return result;
  } catch (error) {
    const fallbackMessage = typeof messages.error === 'string' ? messages.error : 'Action failed.';
    const errorMessage = getApiErrorMessage(error, fallbackMessage);
    const renderedError = typeof messages.error === 'function' ? messages.error(errorMessage) : errorMessage;

    toast.update(toastId, {
      render: renderedError,
      type: 'error',
      isLoading: false,
      autoClose: 4000,
      closeButton: true,
    });

    throw error;
  }
}
