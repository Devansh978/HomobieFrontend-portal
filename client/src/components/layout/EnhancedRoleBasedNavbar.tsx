import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Users,
  Target,
  BarChart3,
  FileText,
  Building2,
  Phone,
  UserCheck,
  Shield,
  Briefcase,
  Calculator,
  ChevronDown,
  User,
  CreditCard,
  HelpCircle,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlassCard } from "@/components/ui/glass-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface EnhancedRoleBasedNavbarProps {
  user: User | null;
  onLogout: () => void;
}

export function EnhancedRoleBasedNavbar({
  user,
  onLogout,
}: EnhancedRoleBasedNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const getRoleNavigation = () => {
    const baseItems = [
      // { path: "/analytics", label: "Analytics", icon: BarChart3 },
      { path: "/settings", label: "Settings", icon: Settings },
    ];

    switch (user?.role) {
      case "builder":
        return [
          { path: "/builder", label: "Builder Portal", icon: Building2 },
          { path: "/leads", label: "Lead Management", icon: Target },
{ path: "/analytics", label: "Analytics", icon: BarChart3 },
          { path: "/upload", label: "Upload Data", icon: Upload },
          ...baseItems,
        ];
      case "telecaller":
        return [
          { path: "/telecaller", label: "Telecaller Portal", icon: Phone },
          { path: "/leads", label: "My Leads", icon: Target },
          { path: "/analytics", label: "Analytics", icon: BarChart3 },
          { path: "/upload", label: "Upload Data", icon: Upload },
          ...baseItems,
        ];
      case "ca":
        return [
          { path: "/ca", label: "CA Dashboard", icon: Calculator },
          { path: "/leads", label: "Applications", icon: FileText },
          { path: "/analytics", label: "Analytics", icon: BarChart3 },
          { path: "/upload", label: "Upload Data", icon: FileText },
          ...baseItems,
        ];
      case "broker":
        return [
          { path: "/broker", label: "Broker Portal", icon: Briefcase },
          { path: "/leads", label: "Client Management", icon: Users },
          { path: "/analytics", label: "Analytics", icon: BarChart3 },
          { path: "/upload", label: "Upload Data", icon: Upload },
          ...baseItems,
        ];
      case "admin":
      case "super_admin":
        return [
          { path: "/admin", label: "Admin Portal", icon: Shield },
          { path: "/builder", label: "Builder Portal", icon: Building2 },
          { path: "/users", label: "User Management", icon: Users },
          { path: "/leads", label: "All Leads", icon: Target },
          { path: "/analytics", label: "Analytics", icon: BarChart3 },
          { path: "/audit", label: "Audit Logs", icon: FileText },
          { path: "/upload", label: "Upload Data", icon: Upload },
          ...baseItems,
        ];
      case "user":
        return [
          { path: "/dashboard", label: "Dashboard", icon: Home },
          // { path: "/leads", label: "My Leads", icon: Target },
          { path: "/upload", label: "Upload Data", icon: Upload },
          ...baseItems,
        ];
      default:
        return [
          { path: "/dashboard", label: "Dashboard", icon: Home },
          // { path: "/leads", label: "My Leads", icon: Target },
          // { path: "/upload", label: "Upload Data", icon: Upload },
          ...baseItems,
        ];
    }
  };

  const navigationItems = getRoleNavigation();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-500/20 text-red-100 border-red-500/30";
      case "admin":
        return "bg-purple-500/20 text-purple-100 border-purple-500/30";
      case "builder":
        return "bg-emerald-500/20 text-black-100 border-emerald-500/30";
      case "ca":
        return "bg-blue-500/20 text-blue-100 border-blue-500/30";
      case "broker":
        return "bg-orange-500/20 text-orange-100 border-orange-500/30";
      case "telecaller":
        return "bg-cyan-500/20 text-cyan-100 border-cyan-500/30";
      default:
        return "bg-gray-500/20 text-black border-gray-500/30";
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Main Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 p-4"
      >
        <GlassCard gradient="neutral" blur="xl" className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <Link href="/dashboard">
                  <a className="block">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-black to-emerald-100 bg-clip-text text-transparent">
                      Homobie
                    </h1>
                    <p className="text-xs text-gray-400">
                      Loan Management System
                    </p>
                  </a>
                </Link>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <Link href={item.path}>
                    <Button
                      variant="ghost"
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        location === item.path
                          ? "bg-emerald-500/20 text-black-900 border border-emerald-500/30"
                          : "text-black-300 hover:text-blue-900 hover:bg-white/10"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  {/* <Bell className="h-5 w-5" />
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    3
                  </Badge> */}
                </Button>
              </motion.div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <div className="text-right">
                      <p className="text-sm font-medium text-black-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={`text-xs text-white px-2 py-0.5 ${getRoleBadgeColor(user.role)}`}
                        >
                          {user.role.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-white/20">
                      <AvatarImage src="" alt={user.firstName} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-blue-500 text-black font-semibold">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-gray-900/95 backdrop-blur-xl border-white/20 mt-2"
                >
                  <DropdownMenuLabel className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" alt={user.firstName} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-blue-500 text-white">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-gray-200 text-sm">{user.email}</p>
                        <Badge
                          className={`text-xs text-white mt-1 ${getRoleBadgeColor(user.role)}`}
                        >
                          {user.role.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer">
                    <User className="h-4 w-4 mr-3" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer">
                    <CreditCard className="h-4 w-4 mr-3" />
                    Billing & Plans
                  </DropdownMenuItem>
                  <DropdownMenuItem className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer">
                    <Settings className="h-4 w-4 mr-3" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer">
                    <HelpCircle className="h-4 w-4 mr-3" />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-gray-200 hover:text-white hover:bg-gray-800 rounded-lg"
                  >
                    {isOpen ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Menu className="h-5 w-5" />
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm pt-20"
            onClick={() => setIsOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <GlassCard
                gradient="neutral"
                blur="xl"
                className="absolute right-4 top-4 w-80 p-6"
              >
                {/* User Profile */}
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-white/10">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" alt={user?.firstName} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-blue-500 text-white">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                    <Badge
                      className={`text-xs mt-1 ${getRoleBadgeColor(user?.role || "")}`}
                    >
                      {user?.role?.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-2 mb-6">
                  {navigationItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                      <motion.div
                        whileHover={{ x: 5 }}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                          location === item.path
                            ? "bg-emerald-500/20 text-emerald-100"
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </motion.div>
                    </Link>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="space-y-2 border-t border-white/10 pt-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onLogout}
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Log out
                  </Button>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
