import { useState, useEffect, useCallback, useRef } from "react";
import { authService, type AuthUser } from "@/lib/auth";
import { useLocation } from "wouter";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializationRef = useRef(false);
  const [, setLocation] = useLocation();

  // Initialize auth state on mount
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Try to get cached user first
        const cachedUser = authService.getUser();
        if (cachedUser) {
          setUser(cachedUser);
          setIsLoading(false);
          return;
        }

        // If no cached user but token exists, fetch current user
        const currentUser = await authService.getUser();
        setUser(currentUser);
      } catch (err) {
        console.warn('Auth initialization failed:', err);
        setUser(null);
        setError('Authentication failed');
        // Clear invalid token
        authService.clearToken?.();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: {
    username: string; password: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      // If response.user is just a role, fetch the full user object
      if (typeof response.email === "string") {
        const currentUser = await authService.getUser();
        setUser(currentUser);
        return { ...response, user: currentUser };
      } else {
        setUser(response.email);
        return response;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);

      // Check if login actually succeeded despite the error
      const token = authService.getToken();
      const currentUser = authService.getUser();

      if (token && currentUser) {
        console.warn('Login succeeded despite error:', errorMessage);
        setUser(currentUser);
        setError(null);
        return { user: currentUser };
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

 const logout = useCallback(async () => {
  setIsLoading(true);
  try {
    await authService.logout();
  } catch (err) {
    console.warn("Logout error:", err);
  } finally {
    setUser(null);
    setError(null);
    setIsLoading(false);
    setLocation("/login");
  }
}, [setLocation]);

  const hasRole = useCallback((roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  }, [user]);

  const hasPermission = useCallback((permission: string) => {
    return authService.hasPermission(permission);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
    hasPermission,
    clearError,
  };
}