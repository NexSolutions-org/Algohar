/**
 * Extracts a readable error message from various error formats
 * Handles JSON strings, Error objects, and plain strings
 */
export function extractErrorMessage(error: any): string {
  if (!error) {
    return "An unexpected error occurred. Please try again.";
  }

  // If it's already a string, try to parse it as JSON
  if (typeof error === "string") {
    // Check if it's a JSON string (starts with { or [)
    if (error.trim().startsWith("{") || error.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(error);
        // If it's a JSON object with a message property
        if (parsed && typeof parsed === "object") {
          if (parsed.message) {
            return parsed.message;
          }
          if (parsed.error) {
            return parsed.error;
          }
          if (parsed.errors) {
            // Handle validation errors
            const firstError = Object.values(parsed.errors)[0];
            if (Array.isArray(firstError) && firstError.length > 0) {
              return firstError[0] as string;
            }
            if (typeof firstError === "string") {
              return firstError;
            }
          }
        }
      } catch {
        // If parsing fails, it's not JSON, continue with original string
      }
    }
    
    // Remove status code prefix (e.g., "403: " or "500: ")
    return error.replace(/^\d+:\s*/, "");
  }

  // If it's an Error object
  if (error instanceof Error) {
    return extractErrorMessage(error.message);
  }

  // If it's an object with a message property
  if (error && typeof error === "object") {
    if (error.message) {
      return extractErrorMessage(error.message);
    }
    if (error.error) {
      return extractErrorMessage(error.error);
    }
    if (error.errors) {
      const firstError = Object.values(error.errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0] as string;
      }
      if (typeof firstError === "string") {
        return firstError;
      }
    }
  }

  // Fallback
  return "An unexpected error occurred. Please try again.";
}

