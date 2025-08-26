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
 * Protected layout (with navbar, background, newsletter, chatbot, etc.)
 */
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const { isNewsletterOpen, closeNewsletter } = useNewsletterModal();
  const initialRoleRef = useRef<string | null>(null);

  useEffect(() => {
    if (user) {
      if (!initialRoleRef.current) {
        initialRoleRef.current = user.role;
      }
      if (initialRoleRef.current !== user.role) {
        if (logout) logout();
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
    return <Redirect to="/login" />;
  }

  return (
    <>
      <GlassBackground />
      {/* <GlassNavbar /> */}
      <main className="pt-16 min-h-screen custom-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <ChatbotWidget />
      <NewsletterModal isOpen={isNewsletterOpen} onClose={closeNewsletter} />
    </>
  );
}
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (user) {
    return <RoleBasedRedirect />;
  }

  return <>{children}</>;
}

/**
 * Role → dashboard mapping
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
 * Root redirect for "/"
 */
function RoleBasedRedirectWrapper() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  return <Redirect to={user ? getRoleBasedRoute(user.role) : "/login"} />;
}

/**
 * Main app router 
 */
function AppRouter() {
  return (
    <Switch>
      {/* Public */}
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

      {/* Protected */}
      <Route path="/dashboard">
        <ProtectedLayout>
          <Dashboard />
        </ProtectedLayout>
      </Route>
      <Route path="/upload">
        <ProtectedLayout>
          <FileUploadPage />
        </ProtectedLayout>
      </Route>
      <Route path="/leads">
        <ProtectedLayout>
          <LeadManagementPage />
        </ProtectedLayout>
      </Route>
      <Route path="/users">
        <ProtectedLayout>
          <UserManagement />
        </ProtectedLayout>
      </Route>
      <Route path="/tracking">
        <ProtectedLayout>
          <Tracking />
        </ProtectedLayout>
      </Route>
      <Route path="/timeline">
        <ProtectedLayout>
          <Tracking />
        </ProtectedLayout>
      </Route>
      <Route path="/analytics">
        <ProtectedLayout>
          <Analytics />
        </ProtectedLayout>
      </Route>
      <Route path="/documents">
        <ProtectedLayout>
          <DocumentManagement />
        </ProtectedLayout>
      </Route>
      <Route path="/builder">
        <ProtectedLayout>
          <SimplifiedBuilderDashboard />
        </ProtectedLayout>
      </Route>
      <Route path="/builder-dashboard">
        <ProtectedLayout>
          <BuilderDashboard />
        </ProtectedLayout>
      </Route>
      <Route path="/telecaller">
        <ProtectedLayout>
          <TelecallerDashboard />
        </ProtectedLayout>
      </Route>
      <Route path="/admin">
        <ProtectedLayout>
          <AdminDashboard />
        </ProtectedLayout>
      </Route>
      <Route path="/broker">
        <ProtectedLayout>
          <BrokerDashboard />
        </ProtectedLayout>
      </Route>
      <Route path="/ca">
        <ProtectedLayout>
          <CADashboard />
        </ProtectedLayout>
      </Route>
      <Route path="/user">
        <ProtectedLayout>
          <UserDashboard />
        </ProtectedLayout>
      </Route>
      <Route path="/telecaller-management">
        <ProtectedLayout>
          <TelecallerManagement />
        </ProtectedLayout>
      </Route>
      <Route path="/banks">
        <ProtectedLayout>
          <BankManagement />
        </ProtectedLayout>
      </Route>
      <Route path="/notifications">
        <ProtectedLayout>
          <NotificationCenter />
        </ProtectedLayout>
      </Route>
      <Route path="/assignments">
        <ProtectedLayout>
          <AssignmentManagement />
        </ProtectedLayout>
      </Route>
      <Route path="/audit-logs">
        <ProtectedLayout>
          <AuditLogs />
        </ProtectedLayout>
      </Route>
      <Route path="/crm-integration">
        <ProtectedLayout>
          <CRMIntegrationStatus />
        </ProtectedLayout>
      </Route>
      <Route path="/settings">
        <ProtectedLayout>
          <Settings />
        </ProtectedLayout>
      </Route>

      {/* Root redirect */}
      <Route path="/">
        <RoleBasedRedirectWrapper />
      </Route>

      {/* 404 */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

/**
 * Main App with providers
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <NotificationManager />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
