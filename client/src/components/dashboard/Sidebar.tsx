import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users, 
  UserCog, 
  FlagTriangleRight, 
  FileText, 
  BarChart3, 
  History, 
  Settings, 
  Plug,
  Plus,
  Bell
} from "lucide-react";
import { authService } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const navigationItems = [
  { path: "/dashboard", icon: Home, label: "Dashboard", permission: null },
  { path: "/leads", icon: Users, label: "Lead Management", permission: null },
  { path: "/users", icon: UserCog, label: "User Management", permission: "manage_users" },
  { path: "/timeline", icon: FlagTriangleRight, label: "FlagTriangleRight Tracking", permission: null },
  { path: "/documents", icon: FileText, label: "Document Manager", permission: null },
  { path: "/analytics", icon: BarChart3, label: "Analytics & Reports", permission: null },
  { path: "/audit-logs", icon: History, label: "Audit Logs", permission: "view_audit_logs" },
];

const integrationItems = [
  { path: "/crm-integration", icon: Plug, label: "CRM Integration", permission: "manage_crm_integrations" },
  { path: "/settings", icon: Settings, label: "Settings", permission: null },
];

export function Sidebar() {
  const [location] = useLocation();
  const user = authService.getUser();

  if (!user) return null;

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = "/login";
  };

  const hasPermission = (permission: string | null) => {
    if (!permission) return true;
    return authService.hasPermission(permission);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-cred-mint rounded-lg flex items-center justify-center">
            <Home className="text-cred-dark text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Homobie</h1>
            <p className="text-xs text-gray-400">Loan Management Portal</p>
          </div>
        </div>
      </div>

      {/* Role Selector */}
      <div className="p-4 border-b border-gray-700">
        <div className="bg-gray-800 rounded-lg p-3">
          <label className="block text-xs text-gray-400 mb-2">Current Role</label>
          <Select value={user.role} disabled>
            <SelectTrigger className="w-full bg-gray-700 text-white border-gray-600">
              <SelectValue>{ROLE_LABELS[user.role]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={user.role}>{ROLE_LABELS[user.role]}</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center mt-2">
            <div className="w-2 h-2 bg-cred-mint rounded-full mr-2"></div>
            <span className="text-xs text-gray-400">
              {user.firstName} {user.lastName} - Active
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            if (!hasPermission(item.permission)) return null;

            const isActive = location === item.path;
            const Icon = item.icon;

            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? "sidebar-active" 
                    : "hover:bg-gray-800"
                }`}>
                  <Icon className="text-sm" size={16} />
                  <span>{item.label}</span>
                  {item.label === "Lead Management" && (
                    <span className="ml-auto bg-cred-orange text-white text-xs px-2 py-1 rounded-full">
                      47
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-400 px-4 mb-2">INTEGRATIONS</p>
          {integrationItems.map((item) => {
            if (!hasPermission(item.permission)) return null;

            const isActive = location === item.path;
            const Icon = item.icon;

            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? "sidebar-active" 
                    : "hover:bg-gray-800"
                }`}>
                  <Icon className="text-sm" size={16} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-cred-mint rounded-full flex items-center justify-center text-cred-dark font-semibold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>
        <Button 
          onClick={handleLogout}
          variant="ghost" 
          size="sm" 
          className="w-full mt-2 text-gray-400 hover:text-white hover:bg-gray-800"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}