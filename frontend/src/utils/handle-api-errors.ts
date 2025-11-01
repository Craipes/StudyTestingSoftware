import { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

interface ApiErrorDetail {
  code?: string;
  message?: string;
  path?: string;
  httpStatus?: number;
  kind?: string;
}

interface ApiErrorResponse {
  title?: string;
  status?: number;
  detail?: string;
  errors?: ApiErrorDetail[];
}

/**
 * Універсальний обробник API-помилок
 * @param error - AxiosError або будь-який інший тип помилки
 * @param defaultMessage - повідомлення за замовчуванням, якщо з сервера нічого не прийшло
 */
export function handleApiError(
  error: unknown,
  defaultMessage: string = 'Сталася помилка.'
): void {
  console.error(error);

  // Якщо це помилка від Axios
  if (isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;

    if (data) {
      // Пріоритет 1: детальне повідомлення
      if (data.detail) {
        toast.error(data.detail);
        return;
      }

      // Пріоритет 2: масив помилок
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        toast.error(data.errors[0].message || defaultMessage);
        return;
      }

      // Пріоритет 3: заголовок або статус
      if (data.title) {
        toast.error(`${data.title} (${data.status || 'невідомий статус'})`);
        return;
      }
    }

    // Якщо відповідь є, але без даних
    if (error.response) {
      toast.error(`Помилка ${error.response.status}: ${error.response.statusText}`);
      return;
    }

    // Якщо проблема з мережею
    toast.error('Не вдалося з’єднатися з сервером.');
  } else {
    // Не AxiosError
    toast.error(defaultMessage);
  }
}

/** Допоміжна функція для перевірки типу AxiosError */
function isAxiosError<T = any>(error: any): error is AxiosError<T> {
  return !!(error && error.isAxiosError);
}
