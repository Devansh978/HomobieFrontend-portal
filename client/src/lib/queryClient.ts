// Frontend CORS fixes and diagnostics

import { QueryClient, QueryFunction, QueryKey } from "@tanstack/react-query";

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";
  body?: any;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
  skipAuth?: boolean;
  noCors?: boolean; // Option to skip CORS for same-origin requests
};

type UnauthorizedBehavior = "returnNull" | "throw" | "logout";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://homobiebackend-railway-production.up.railway.app';

/**
 * CORS-aware API request function
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const method = options?.method || "GET";

  // Check if this is a same-origin request
  const currentOrigin = window.location.origin;
  const targetOrigin = new URL(url).origin;
  const isSameOrigin = currentOrigin === targetOrigin;

  // Prepare headers - be careful with CORS triggering headers
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options?.headers || {}),
  };

  // CORS FIX 1: Only add Content-Type for requests that need it
  // Adding Content-Type: application/json triggers CORS preflight
  if (options?.body && method !== 'GET' && method !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
  }

  // CORS FIX 2: Only add Authorization header if we have a token
  if (!options?.skipAuth) {
    const token = localStorage.getItem("authToken") || localStorage.getItem("auth_token");
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const body = options?.body ? JSON.stringify(options.body) : undefined;

  // CORS FIX 3: Dynamic fetch options based on request type
  const fetchOptions: RequestInit = {
    method,
    headers,
    body,
    signal: options?.signal,
  };

  // CORS FIX 4: Only set CORS-specific options for cross-origin requests
  if (!isSameOrigin && !options?.noCors) {
    fetchOptions.mode = 'cors';
    fetchOptions.credentials = options?.credentials || 'include';
  } else if (isSameOrigin) {
    // For same-origin requests, use default mode
    fetchOptions.credentials = options?.credentials || 'same-origin';
  }

  try {
    console.debug('[API Request]', {
      url,
      method,
      isSameOrigin,
      mode: fetchOptions.mode,
      credentials: fetchOptions.credentials,
      headers: { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : undefined },
    });

    const response = await fetch(url, fetchOptions);

    console.debug('[API Response]', {
      status: response.status,
      url,
      corsHeaders: {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
      }
    });

    // Handle unauthorized responses
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("auth_token");
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const errorData = await parseErrorResponse(response);
      const error = new Error(errorData.message || `Request failed with status ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    try {
      return await response.json() as T;
    } catch (e) {
      console.error('JSON parse error:', e);
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    // CORS FIX 5: Enhanced CORS error detection and handling
    if (error instanceof TypeError) {
      if (error.message.includes('Failed to fetch')) {
        console.error('[CORS ERROR]', {
          url,
          method,
          message: 'Network request failed - likely CORS issue',
          suggestion: 'Check backend CORS headers and browser console for CORS errors'
        });
        throw new Error('Network error: Unable to reach server. This may be a CORS issue.');
      }

      if (error.message.includes('NetworkError')) {
        console.error('[NETWORK ERROR]', {
          url,
          method,
          message: 'Network error - check CORS or connectivity'
        });
        throw new Error('Network error: Please check your connection and server configuration.');
      }
    }


  }
}

/**
 * CORS diagnostic function - run this to test your backend
 */
export const diagnoseCORS = async (): Promise<{
  canConnect: boolean;
  corsHeaders: Record<string, string | null>;
  issues: string[];
}> => {
  const issues: string[] = [];
  let canConnect = false;
  let corsHeaders: Record<string, string | null> = {};

  try {
    // Test 1: Simple GET request
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      mode: 'cors',
    });

    canConnect = true;

    // Collect CORS headers
    corsHeaders = {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
    };

    // Check for common CORS issues
    if (!corsHeaders['access-control-allow-origin']) {
      issues.push('Missing Access-Control-Allow-Origin header');
    }

    if (corsHeaders['access-control-allow-origin'] === '*' &&
      corsHeaders['access-control-allow-credentials'] === 'true') {
      issues.push('Invalid combination: wildcard origin with credentials');
    }

    // Test 2: Preflight request simulation
    try {
      const preflightResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'OPTIONS',
        mode: 'cors',
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization',
        },
      });

      if (!preflightResponse.ok) {
        issues.push('Preflight request failed - backend may not handle OPTIONS requests');
      }
    } catch (e) {
      issues.push('Preflight request failed - likely CORS configuration issue');
    }

  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      issues.push('Cannot connect to backend - CORS policy blocking request');
    } else {
      issues.push(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return { canConnect, corsHeaders, issues };
};

/**
 * Frontend CORS workaround for development
 */
export const createCORSWorkaround = () => {
  // Only for development - detect if we're in dev mode
  const isDev = import.meta.env.DEV || window.location.hostname === 'localhost';

  if (isDev) {
    console.warn('🚨 CORS workaround active - only for development!');

    // Option 1: Use a proxy URL for dev (you'd need to set this up)
    // const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
    // return (url: string) => `${PROXY_URL}${url}`;

    // Option 2: Modify requests to avoid CORS triggers
    return {
      shouldSkipCORS: true,
      modifyHeaders: (headers: Record<string, string>) => {
        // Remove headers that trigger CORS preflight
        const { 'Content-Type': _, ...otherHeaders } = headers;
        return otherHeaders;
      }
    };
  }

  return null;
};

/**
 * Enhanced login with CORS awareness
 */
export const loginUser = async (credentials: { username: string; password: string }) => {
  try {
    // First, diagnose CORS if login fails
    const corsWorkaround = createCORSWorkaround();

    const response = await apiRequest<{
      token: string;
      refreshToken?: string;
      user?: any;
    }>('/auth/login', {
      method: "POST",
      body: credentials,
      credentials: 'include',
      skipAuth: true,
      ...(corsWorkaround ? { noCors: corsWorkaround.shouldSkipCORS } : {}),
    });

    if (!response.token) {
      throw new Error('Authentication failed: No token received');
    }

    localStorage.setItem("authToken", response.token);
    if (response.refreshToken) {
      localStorage.setItem("refreshToken", response.refreshToken);
    }
    if (response.user) {
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  } catch (error) {
    // If login fails, run CORS diagnostics
    console.error('[Login Failed]', error);

    // Auto-diagnose CORS issues
    const diagnosis = await diagnoseCORS();
    if (diagnosis.issues.length > 0) {
      console.error('[CORS Issues Detected]', diagnosis.issues);
    }

    throw new Error(
      error instanceof Error ? error.message : 'Login failed. Please try again.'
    );
  }
};

/**
 * Utility to check if current environment has CORS issues
 */
export const checkCORSEnvironment = () => {
  const currentOrigin = window.location.origin;
  const apiOrigin = new URL(API_BASE_URL).origin;

  return {
    currentOrigin,
    apiOrigin,
    isSameOrigin: currentOrigin === apiOrigin,
    needsCORS: currentOrigin !== apiOrigin,
    isLocalhost: currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1'),
    isProduction: !currentOrigin.includes('localhost') && !currentOrigin.includes('127.0.0.1'),
  };
};

/**
 * Browser CORS support detection
 */
export const detectCORSSupport = () => {
  const xhr = new XMLHttpRequest();
  const corsSupported = 'withCredentials' in xhr;

  return {
    corsSupported,
    fetchSupported: typeof fetch !== 'undefined',
    browser: navigator.userAgent,
    recommendation: corsSupported ? 'CORS supported' : 'Use JSONP or proxy for older browsers'
  };
};

// Export enhanced error parser
async function parseErrorResponse(response: Response): Promise<{ message: string, details?: any }> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  try {
    const text = await response.text();
    if (isJson && text) {
      const data = JSON.parse(text);
      return {
        message: data.message || data.error || response.statusText,
        details: data.details
      };
    }
    return { message: text || response.statusText };
  } catch {
    return { message: response.statusText };
  }
}

// Enhanced query function with CORS awareness
export const createQueryFn = <T>(options?: {
  unauthorizedBehavior?: UnauthorizedBehavior;
}): QueryFunction<T, QueryKey> => async ({ queryKey, signal }) => {
  const [endpoint, params] = Array.isArray(queryKey)
    ? [queryKey[0], queryKey[1]]
    : [queryKey, undefined];

  if (typeof endpoint !== "string") {
    throw new Error("Query key must be a string URL");
  }

  try {
    return await apiRequest<T>(endpoint, {
      method: "GET",
      signal,
      ...(params ? { body: params } : {}),
    });
  } catch (error) {
    const status = (error as any)?.status;

    if (error instanceof Error && status === 401) {
      switch (options?.unauthorizedBehavior || "logout") {
        case "returnNull":
          return null as T;
        case "logout":
          localStorage.removeItem("authToken");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return null as T;
        case "throw":
        default:
          throw error;
      }
    }
    throw error;
  }
};

// Enhanced query client with CORS error handling
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: createQueryFn({ unauthorizedBehavior: "logout" }),
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = (error as any)?.status;

        // Don't retry on auth errors
        if (status === 401 || status === 403) {
          return false;
        }

        // Don't retry on CORS errors
        if (error instanceof TypeError &&
          (error.message.includes('Failed to fetch') ||
            error.message.includes('NetworkError'))) {
          return false;
        }

        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000,
      // cacheTime: 15 * 60 * 1000,
    },
    mutations: {
      retry: false,
    },
  },
});

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/register/user',
    logout: '/auth/logout',
    refresh: '/auth/refresh',

  },
  health: '/health',
};

export const clearAuth = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("auth_token");
};