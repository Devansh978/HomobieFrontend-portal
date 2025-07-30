import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";


export function RoleBasedRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Define role-based redirects
      const roleRoutes = {
        super_admin: "/admin",
        admin: "/admin",
        builder: "/builder",
        telecaller: "/telecaller",
        broker: "/broker",
        ca: "/ca",
        user: "/user"
      };

      const targetRoute = roleRoutes[user.role];
      if (targetRoute) {
        navigate(targetRoute);
      }
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  return null; // This component only handles navigation
}