import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { extractErrorMessage } from "./errorUtils";

// Determine API base URL based on environment
function getApiBaseUrl(): string {
  // If explicitly set via environment variable, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If running on production domain, use the same domain for API
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    // Check if we're on the production domain
    if (hostname === 'algohar.org' || hostname.includes('algohar.org')) {
      // For production, API is on the same domain
      // Return base URL without trailing slash (URLs will start with /api)
      return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    }
  }
  
  // Default to localhost for development
  return "http://localhost:8000";
}

export const API_BASE_URL = getApiBaseUrl();

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // Handle 403 Forbidden (account deactivated)
    if (res.status === 403) {
      try {
        const errorData = JSON.parse(text);
        // If account is deactivated, log out the user
        if (errorData.message && (
          errorData.message.includes('deactivated') || 
          errorData.message.includes('pending')
        )) {
          localStorage.removeItem("user");
          
          // Redirect to login page
          if (window.location.pathname.startsWith('/user') || window.location.pathname.startsWith('/admin')) {
            window.location.href = '/login';
          }
        }
      } catch {
        // If parsing fails, still log out on 403
        if (res.status === 403) {
          localStorage.removeItem("user");
          if (window.location.pathname.startsWith('/user') || window.location.pathname.startsWith('/admin')) {
            window.location.href = '/login';
          }
        }
      }
    }
    
    // Extract readable error message from JSON response
    const errorMessage = extractErrorMessage(text);
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  return headers;
}

// Ensure CSRF cookie exists before making state-changing requests
async function ensureCsrfCookie(): Promise<void> {
  // Laravel/Sanctum will set XSRF-TOKEN cookie on this endpoint
  await fetch(`${API_BASE_URL.replace(/\/$/, '')}/sanctum/csrf-cookie`, {
    credentials: "include",
  });
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Construct full URL - ensure proper joining of base URL and path
  let fullUrl: string;
  if (url.startsWith("http")) {
    fullUrl = url;
  } else {
    // Ensure URL starts with / and base URL doesn't end with /
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    fullUrl = `${baseUrl}${path}`;
  }
  
  const headers = getAuthHeaders();
  
  // Debug: Log token presence and URL construction
  if (import.meta.env.DEV || import.meta.env.MODE === 'production') {
    console.log('API Request:', { 
      method, 
      url: fullUrl, 
      baseUrl: API_BASE_URL 
    });
  }
  
  // For non-GET requests, make sure CSRF cookie is present
  if (method.toUpperCase() !== "GET") {
    await ensureCsrfCookie();
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // ensure cookies (session) are sent
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    
    // Construct full URL - ensure proper joining of base URL and path
    let fullUrl: string;
    if (url.startsWith("http")) {
      fullUrl = url;
    } else {
      // Ensure URL starts with / and base URL doesn't end with /
      const baseUrl = API_BASE_URL.replace(/\/$/, '');
      const path = url.startsWith('/') ? url : `/${url}`;
      fullUrl = `${baseUrl}${path}`;
    }
    
    const headers = getAuthHeaders();
    
    // Debug: Log token presence and URL construction
    if (import.meta.env.DEV || import.meta.env.MODE === 'production') {
      console.log('Query Request:', { 
        url: fullUrl, 
        baseUrl: API_BASE_URL 
      });
    }
    
    const res = await fetch(fullUrl, {
      headers,
      credentials: "include", // ensure cookies (session) are sent
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
