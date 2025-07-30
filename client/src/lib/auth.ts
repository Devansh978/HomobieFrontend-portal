// src/lib/auth.ts
import { apiRequest } from "./queryClient";

export interface AuthUser {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  role: UserRole;
  isVerified?: boolean;
  createdAt?: string;
  userId: string;
}

export type UserRole = "super_admin" | "admin" | "ca" | "builder" | "broker" | "user" | "telecaller";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  role: UserRole;
  company: string;
}

export interface AuthResponse {
  email: string;
  role: string; // Note: This is a string in the response, not UserRole type
  token: string;
  refreshToken: string;
  message?: string;
  firstName: string;
  lastName: string;
  userId: string;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export class AuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private user: AuthUser | null = null;
  private readonly baseUrl = "https://homobiebackend-railway-production.up.railway.app";
  private tokenRefreshPromise: Promise<void> | null = null;

  constructor() {
    this.loadFromStorage();
    this.setupTokenRefresh();
  }

  // Initialize from localStorage
private loadFromStorage() {
  if (typeof window !== "undefined") {

    this.token = localStorage.getItem("auth_token");
    this.refreshToken = localStorage.getItem("auth_refresh_token");

    const userJson = localStorage.getItem("auth_user");
    try {
      // Safely parse the user data. If userJson is null, null is assigned.
      // If parsing fails, the catch block will handle it.
      this.user = userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error("Could not parse auth_user from localStorage, resetting.", error);
      // If data is corrupted, set user to null and remove the bad entry
      this.user = null;
      localStorage.removeItem("auth_user");
    }

  
  }
}

  // Save auth data to storage
  private saveToStorage(token: string, refreshToken: string, user: AuthUser) {
    this.token = token;
    this.refreshToken = refreshToken;
    this.user = user;

    if (typeof window !== "undefined") {
      
      localStorage.setItem("auth_token", token);
      
      localStorage.setItem("auth_refresh_token", refreshToken);
      localStorage.setItem("auth_user", JSON.stringify(user));

    }
  }

  // Clear auth data
  private clearStorage() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_refresh_token");
      localStorage.removeItem("auth_user");
    }
  }

  // Clear token method for external use
  clearToken() {
    this.clearStorage();
  }

  // Setup automatic token refresh
  private setupTokenRefresh() {
    if (typeof window !== "undefined" && this.token && this.refreshToken) {
      const jwt = this.parseJwt(this.token);
      if (jwt && jwt.exp) {
        const expiresIn = (jwt.exp * 1000) - Date.now() - 60000;
        if (expiresIn > 0) {
          setTimeout(() => this.refreshAuthToken(), expiresIn);
        }
      }
    }
  }

  // Parse JWT token
  private parseJwt(token: string) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiRequest<AuthResponse>(`${this.baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // Validate response structure
      if (!this.isValidAuthResponse(response)) {
        throw new Error("Invalid response from server");
      }

      // Save auth data
      const user: AuthUser = {
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role.toLowerCase() as UserRole,
        userId: response.userId // Convert to lowercase to match UserRole type
      };

      this.saveToStorage(
        response.token,
        response.refreshToken || "",
        user
      );
      this.setupTokenRefresh();

      return response;
    } catch (error) {
      throw this.createAuthError(error, "Registration failed");
    }
  }

  // User login - FIXED VERSION
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiRequest<AuthResponse>(`${this.baseUrl}/auth/login`, {
        method: "POST",
        body: credentials,
        skipAuth: true,
        credentials: 'include'
      });

      if (!this.isValidAuthResponse(response)) {
        throw new Error("Invalid credentials");
      }

      // Create user object from response
      const user: AuthUser = {
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role.toLowerCase() as UserRole,
        userId: response.userId // Convert to lowercase to match UserRole type
      };

      // Save auth data
      this.saveToStorage(
        response.token,
        response.refreshToken,
        user
      );
      this.setupTokenRefresh();

      return response;
    } catch (error) {
      throw this.createAuthError(error, "Login failed");
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      if (this.token) {
        await apiRequest(`${this.baseUrl}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearStorage();
    }
  }

  // Refresh auth token
  public async refreshAuthToken(): Promise<void> {
    if (!this.refreshToken || this.tokenRefreshPromise) return;

    try {
      this.tokenRefreshPromise = apiRequest<AuthResponse>(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.refreshToken}`,
        },
      }).then(response => {
        // Create user object from response
        const user: AuthUser = {
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.role.toLowerCase() as UserRole,
          userId: response.userId // Convert to lowercase to match UserRole type
        };
        if (this.isValidAuthResponse(response)) {
          this.saveToStorage(
            response.token,
            response.refreshToken || this.refreshToken || "",
            user
          );
          this.setupTokenRefresh();
        }
      }).finally(() => {
        this.tokenRefreshPromise = null;
      });

      await this.tokenRefreshPromise;
    } catch (error) {
      this.clearStorage();
      console.error("Token refresh failed:", error);
    }
  }

  // Get current user (with optional force refresh)
  // async getCurrentUser(forceRefresh = false): Promise<AuthUser | null> {
  //   if (!this.token) return null;

  //   if (forceRefresh) {
  //     try {
  //       const response = await apiRequest<{ user: AuthUser }>(`${this.baseUrl}/auth/me`, {
  //         headers: {
  //           Authorization: `Bearer ${this.token}`,
  //         },
  //       });

  //       if (response.user) {
  //         this.user = response.user;
  //         if (typeof window !== "undefined") {
  //           localStorage.setItem("auth_user", JSON.stringify(response.user));
  //         }
  //         return response.user;
  //       }
  //     } catch (error) {
  //       console.error("Failed to refresh user data:", error);
  //     }
  //   }

  //   return this.user;
  // }

  // // Verify email
  // async verifyEmail(token: string): Promise<AuthResponse> {
  //   try {
  //     const response = await apiRequest<AuthResponse>(`${this.baseUrl}/auth/verify-email`, {
  //       method: "POST",
  //       body: JSON.stringify({ token }),
  //     });

  //     if (this.isValidAuthResponse(response)) {
  //       this.saveToStorage(
  //         response.token,
  //         response.refreshToken || this.refreshToken || "",
  //         response.user
  //       );
  //       this.setupTokenRefresh();
  //     }

  //     return response;
  //   } catch (error) {
  //     throw this.createAuthError(error, "Email verification failed");
  //   }
  // }

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return apiRequest(`${this.baseUrl}/auth/request-password-reset`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  // // Reset password
  // async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
  //   try {
  //     const response = await apiRequest<AuthResponse>(`${this.baseUrl}/auth/reset-password`, {
  //       method: "POST",
  //       body: JSON.stringify({ token, newPassword }),
  //     });

  //     if (this.isValidAuthResponse(response)) {
  //       this.saveToStorage(
  //         response.token,
  //         response.refreshToken || "",
  //         response.user
  //       );
  //       this.setupTokenRefresh();
  //     }

  //     return response;
  //   } catch (error) {
  //     throw this.createAuthError(error, "Password reset failed");
  //   }
  // }

  // Validate auth response structure
  // private isValidAuthResponse(response: any): response is AuthResponse {
  //   return response &&
  //     typeof response.token === 'string' &&
  //     response.token.length > 0 &&
  //     response.user &&
  //     typeof response.user === 'object' &&
  //     response.user.id;
  // }
  // Update your type guard to match the actual response structure
  private isValidAuthResponse(response: any): response is AuthResponse {
    return (
      response &&
      typeof response.token === 'string' &&
      response.token.length > 0 &&
      typeof response.refreshToken === 'string' &&
      response.refreshToken.length > 0 &&
      typeof response.email === 'string' &&
      typeof response.role === 'string' &&
      typeof response.firstName === 'string' &&
      typeof response.lastName === 'string'
    );
  }

  // If you want to transform the backend response to match AuthResponse
  // (Removed unused transformAuthResponse method and example usage)

  // Get current token
  public getToken(): string | null {
    return this.token;
  }

  // Get current user
  public getUser(): AuthUser | null {
    return this.user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  // Check if user has specific role
  hasRole(roles: UserRole[]): boolean {
    return this.user ? roles.includes(this.user.role) : false;
  }

  // Check if user has permission
  hasPermission(permission: string): boolean {
    if (!this.user) return false;

    const rolePermissions: Record<UserRole, string[]> = {
      super_admin: [
        "manage_users",
        "manage_all_leads",
        "view_audit_logs",
        "manage_crm_integrations",
        "assign_leads",
        "delete_leads",
      ],
      admin: [
        "manage_users",
        "manage_all_leads",
        "view_audit_logs",
        "assign_leads",
        "delete_leads",
      ],
      telecaller: [
        "manage_all_leads",
        "customize_leads",
      ],
      ca: [
        "manage_all_leads",
        "view_audit_logs",
      ],
      builder: [
        "view_own_leads",
        "create_leads",
      ],
      broker: [
        "view_own_leads",
        "create_leads",
        "manage_own_leads",
      ],
      user: [
        "view_own_leads",
      ],
    };

    return rolePermissions[this.user.role]?.includes(permission) || false;
  }

  // FIXED: Create proper error without always throwing
  private createAuthError(error: unknown, defaultMessage: string): Error {
    if (typeof error === "object" && error !== null) {
      const apiError = error as ApiError;

      if (apiError.status === 401) {
        this.clearStorage();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }

      return new Error(apiError.message || defaultMessage);
    } else if (typeof error === "string") {
      return new Error(error);
    } else {
      return new Error(defaultMessage);
    }
  }

  // DEPRECATED: The handleApiError method has been removed as it was unused.
}

export const authService = new AuthService();

// Enhanced authenticated fetch with better error handling
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = authService.getToken();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Try to refresh token if we have a refresh token
      if (authService.getToken() && authService.getUser()) {
        await authService.refreshAuthToken();
        const newToken = authService.getToken();
        if (newToken) {
          headers.set("Authorization", `Bearer ${newToken}`);
          return fetch(url, {
            ...options,
            headers,
          });
        }
      }

      // If still unauthorized, logout
      await authService.logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please login again.");
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Session expired")) {
      throw error;
    }
    throw new Error("Network request failed");
  }
}