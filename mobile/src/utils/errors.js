export function getErrorMessage(error, fallback = 'Something went wrong.') {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ERR_NETWORK') return 'Unable to connect. Check your internet connection.';
  if (error?.response?.status === 404) return 'The requested item was not found.';
  if (error?.response?.status >= 500) return 'The server is unavailable. Please try again.';
  return error?.message || fallback;
}
