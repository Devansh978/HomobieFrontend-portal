import React, { useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
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

// Pages (assuming all imports are correct)
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
 * A layout component for protected routes. It handles authentication,
 * role change checks, and renders the common UI layout.
 * Child routes are rendered via the <Outlet /> component.
 */
function ProtectedLayout() {
  const { user, isLoading, logout } = useAuth();
  const { isNewsletterOpen, closeNewsletter } = useNewsletterModal();
  const initialRoleRef = useRef<string | null>(null);

  useEffect(() => {
    if (user) {
      if (!initialRoleRef.current) {
        initialRoleRef.current = user.role;
      }
      if (initialRoleRef.current !== user.role) {
        if (logout) {
          logout();
        }
      }
    }
  }, [user, logout]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <GlassBackground />
      <GlassNavbar />
      <main className="pt-16 min-h-screen custom-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Child routes will be rendered here */}
          <Outlet />
        </div>
      </main>
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
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
 */
function getRoleBasedRoute(role: string): string {
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
  const { user, isLoading } = useAuth();

  // Wait for auth check to complete before redirecting
  if (isLoading) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  return <Navigate to={user ? getRoleBasedRoute(user.role) : "/login"} />;
}


/**
 * Main router component that defines all application routes.
 * This version is simplified, correct, and follows best practices.
 */
function AppRouter() {
  return (
    <Routes>
      {/* Public routes accessible only to non-authenticated users */}
      <Route path="/login" element={<PublicRoute><GlassLogin /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected Routes: All routes within this element will share the ProtectedLayout */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<FileUploadPage />} />
        <Route path="/leads" element={<LeadManagementPage />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/timeline" element={<Tracking />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/documents" element={<DocumentManagement />} />
        <Route path="/builder" element={<SimplifiedBuilderDashboard />} />
        <Route path="/builder-dashboard" element={<BuilderDashboard />} />
        <Route path="/telecaller" element={<TelecallerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/broker" element={<BrokerDashboard />} />
        <Route path="/ca" element={<CADashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/telecaller-management" element={<TelecallerManagement />} />
        <Route path="/banks" element={<BankManagement />} />
        <Route path="/notifications" element={<NotificationCenter />} />
        <Route path="/assignments" element={<AssignmentManagement />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/crm-integration" element={<CRMIntegrationStatus />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Root redirect handles where to send users who visit "/" */}
      <Route path="/" element={<RoleBasedRedirectWrapper />} />

      {/* 404 fallback for any route not matched */}
      <Route path="*" element={<NotFound />} />
    </Routes>
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
        {/* The useAuth hook will be available to all components within Router */}
        
            <AppRouter />
        
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
