/**
 * Extract a user-friendly message from Django REST Framework error responses.
 */
export function getApiErrorMessage(error) {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (error.detail) return error.detail;
  if (error.non_field_errors?.[0]) return error.non_field_errors[0];

  const firstValue = Object.values(error)[0];
  if (Array.isArray(firstValue)) return firstValue[0];
  if (typeof firstValue === 'string') return firstValue;

  return 'Something went wrong. Please try again.';
}
