/**
 * Extract a user-friendly error message from an Axios error response.
 * Falls back to the provided default message when the response structure
 * doesn't match the expected API error format.
 */
export function extractError(err: unknown, fallback: string): { message: string; status: number } {
  if (
    typeof err === 'object' &&
    err !== null &&
    'response' in err
  ) {
    const axiosErr = err as { response?: { status?: number; data?: { error?: { message?: string; details?: Array<{ message?: string }> } } } };
    const errorData = axiosErr.response?.data?.error;
    const detailMessage = errorData?.details?.[0]?.message;
    return {
      message: detailMessage || errorData?.message || fallback,
      status: axiosErr.response?.status || 500,
    };
  }
  return { message: fallback, status: 500 };
}

/**
 * Shorthand that returns only the message string (for pages that don't need the status code).
 */
export function extractErrorMessage(err: unknown, fallback: string): string {
  return extractError(err, fallback).message;
}
