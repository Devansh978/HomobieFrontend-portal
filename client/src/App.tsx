import React, { useEffect, useRef } from "react";
import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { GlassNavbar } from "@/components/layout/GlassNavbar";
import { GlassBackground } from "@/components/layout/GlassBackground";
import {
  NewsletterModal,
  useNewsletterModal,
} from "@/components/ui/newsletter-modal";
import { RoleBasedRedirect } from "@/components/auth/RoleBasedRedirect";
import { NotificationManager } from "@/components/ui/animated-notification";
import { ChatbotWidget } from "@/components/dashboard/ChatbotWidget";

// Pages
import Dashboard from "@/pages/Dashboard";
import { FileUploadPage } from "@/pages/FileUploadPage";
import LeadManagementPage from "@/pages/LeadManagement";
import UserManagement from "@/pages/UserManagement";
import AuditLogs from "@/pages/AuditLogs";
import { Tracking } from "@/pages/Tracking";
import Analytics from "@/pages/Analytics";
import { Settings } from "@/pages/Settings";
import GlassLogin from "@/pages/GlassLogin";
import Register from "@/pages/Register";
import NotFound from "@/pages/not-found";
import { CRMIntegrationStatus } from "@/components/dashboard/CRMIntegrationStatus";
import { DocumentManager } from "@/components/dashboard/DocumentManager";
import BuilderDashboard from "@/pages/BuilderDashboard";
import SimplifiedBuilderDashboard from "@/pages/SimplifiedBuilderDashboard";
import TelecallerDashboard from "@/pages/TelecallerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import BrokerDashboard from "@/pages/BrokerDashboard";
import CADashboard from "@/pages/CADashboard";
import TelecallerPortal from "@/pages/TelecallerPortal";
import UserDashboard from "@/pages/UserDashboard";
import DocumentManagement from "@/pages/DocumentManagement";
import TelecallerManagement from "@/pages/TelecallerManagement";
import BankManagement from "@/pages/BankManagement";
import NotificationCenter from "@/pages/NotificationCenter";
import AssignmentManagement from "@/pages/AssignmentManagement";

/**
 * A component that protects routes requiring authentication.
 * It also checks if the user's role has changed during their session.
 * If the role changes, it logs the user out, forcing re-authentication.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // The useAuth hook must provide a `logout` function.
  const { user, isLoading, logout } = useAuth();
  const { isNewsletterOpen, closeNewsletter } = useNewsletterModal();

  // A ref to store the user's initial role when the session starts.
  const initialRoleRef = useRef<string | null>(null);

  useEffect(() => {
    // Only run logic if there is a logged-in user.
    if (user) {
      // If we haven't stored the initial role yet, store it now.
      if (!initialRoleRef.current) {
        initialRoleRef.current = user.role;
      }

      // On every check, compare the current role with the initial one.
      // If they differ, the user's permissions have been changed.
      if (initialRoleRef.current !== user.role) {
        // Log the user out to enforce the new role on the next login.
        if (logout) {
          logout();
        }
      }
    }
  }, [user, logout]); // This effect re-runs whenever the user object changes.

  // Display a loading spinner while authentication status is being determined.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassBackground />
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If there is no user (either initially or after being logged out), redirect to the login page.
  if (!user) {
    return <Redirect to="/login" />;
  }

  // If the user is authenticated and their role is consistent, render the requested page.
  return (
    <>
      <GlassBackground />
      <GlassNavbar />
      <div className="pt-16 min-h-screen custom-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
      <ChatbotWidget />
      <NewsletterModal isOpen={isNewsletterOpen} onClose={closeNewsletter} />
    </>
  );
}

/**
 * A component for public routes (e.g., login, register).
 * If a user is already logged in, it redirects them to their appropriate dashboard.
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cred-mint"></div>
      </div>
    );
  }

  // If a user is logged in, don't show the public page; redirect them.
  if (user) {
    return <RoleBasedRedirect />;
  }

  return <>{children}</>;
}

/**
 * Determines the correct dashboard URL based on the user's role.
 * @param {string} role - The user's role.
 * @returns {string} The path to the user's dashboard.
 */
function getRoleBasedRoute(role: string) {
  const routes: Record<string, string> = {
    super_admin: "/admin",
    admin: "/admin",
    builder: "/builder-dashboard",
    telecaller: "/telecaller",
    broker: "/broker",
    ca: "/ca",
    user: "/dashboard",
  };
  return routes[role] || "/dashboard";
}

/**
 * A wrapper component to handle the initial redirect after login or for root access.
 */
function RoleBasedRedirectWrapper() {
  const { user } = useAuth();
  return <Redirect to={user ? getRoleBasedRoute(user.role) : "/login"} />;
}

/**
 * Main router component that defines all application routes.
 */
function Router() {
  return (
    <Switch>
      {/* Public routes accessible only to non-authenticated users */}
      <Route path="/login">
        <PublicRoute>
          <GlassLogin />
        </PublicRoute>
      </Route>

      <Route path="/register">
        <PublicRoute>
          <Register />
        </PublicRoute>
      </Route>

      {/* Protected routes that require authentication */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/upload">
        <ProtectedRoute>
          <FileUploadPage />
        </ProtectedRoute>
      </Route>

      <Route path="/leads">
        <ProtectedRoute>
          <LeadManagementPage />
        </ProtectedRoute>
      </Route>

      <Route path="/tracking">
        <ProtectedRoute>
          <Tracking />
        </ProtectedRoute>
      </Route>

      <Route path="/timeline">
        <ProtectedRoute>
          <Tracking />
        </ProtectedRoute>
      </Route>

      <Route path="/analytics">
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      </Route>

      <Route path="/documents">
        <ProtectedRoute>
          <DocumentManager />
        </ProtectedRoute>
      </Route>

      <Route path="/builder">
        <ProtectedRoute>
          <SimplifiedBuilderDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/builder-dashboard">
        <ProtectedRoute>
          <BuilderDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/telecaller">
        <ProtectedRoute>
          <TelecallerDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/admin">
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/broker">
        <ProtectedRoute>
          <BrokerDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/ca">
        <ProtectedRoute>
          <CADashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/user">
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/documents">
        <ProtectedRoute>
          <DocumentManagement />
        </ProtectedRoute>
      </Route>

      <Route path="/telecaller-management">
        <ProtectedRoute>
          <TelecallerManagement />
        </ProtectedRoute>
      </Route>

      <Route path="/banks">
        <ProtectedRoute>
          <BankManagement />
        </ProtectedRoute>
      </Route>

      <Route path="/notifications">
        <ProtectedRoute>
          <NotificationCenter />
        </ProtectedRoute>
      </Route>

      <Route path="/assignments">
        <ProtectedRoute>
          <AssignmentManagement />
        </ProtectedRoute>
      </Route>

      <Route path="/audit-logs">
        <ProtectedRoute>
          <AuditLogs />
        </ProtectedRoute>
      </Route>

      <Route path="/crm-integration">
        <ProtectedRoute>
          <CRMIntegrationStatus />
        </ProtectedRoute>
      </Route>

      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>

      {/* Root redirect handles where to send users who visit "/" */}
      <Route path="/">
        <RoleBasedRedirectWrapper />
      </Route>

      {/* 404 fallback for any route not matched */}
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * The main App component that sets up all the providers and the router.
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <NotificationManager />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
