export const successResponse = <T>(data: T, message?: string) => ({
  status: 'success' as const,
  ...(message ? { message } : {}),
  data,
});

export const errorResponse = (message: string, errors?: string[]) => ({
  status: 'error' as const,
  message,
  ...(errors?.length ? { errors } : {}),
});
