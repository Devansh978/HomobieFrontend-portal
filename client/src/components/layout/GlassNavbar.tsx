import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  Bell,
  User,
  Building,
  Phone
} from "lucide-react";
import { useState } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { cn } from "@/lib/utils";

// STEP 1: Define all possible nav items with their required roles
const allNavItems = [
  { path: "/dashboard", label: "Dashboard", icon: Home, roles: ['admin', 'telecaller', 'builder', 'ca', 'broker', 'user'] },
  { path: "/leads", label: "Leads", icon: FileText, roles: ['admin', 'telecaller', 'builder',] },
  { path: "/upload", label: "Documents", icon: FileText, roles: ['admin', 'builder', 'telecaller', 'user'] },
  { path: "/builder", label: "Builder", icon: Building, roles: ['builder'] },
  { path: "/telecaller", label: "Telecaller", icon: Phone, roles: ['telecaller'] },
  { path: "/users", label: "Users", icon: Users, roles: ['admin'] },
  { path: "/analytics", label: "Analytics", icon: BarChart3, roles: ['admin', 'telecaller', 'builder'] },
  { path: "/settings", label: "Settings", icon: Settings, roles: ['admin', 'telecaller', 'builder','user', 'ca', 'broker'] },
];

// STEP 2: Mock an authentication hook. In a real app, this comes from your auth provider.
const useAuth = () => {
  // Change 'admin' to 'telecaller' or 'builder' to test different views.
  return { user: { role: 'admin' } }; 
};

export function GlassNavbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // STEP 3: Get the user's role and filter the navigation items
  const { user } = useAuth();
  const userRole = user ? user.role : 'guest'; // Default to 'guest' if not logged in

  const accessibleNavItems = allNavItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Homobie
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {/* STEP 4: Render the filtered list of items */}
              {accessibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <motion.div
                      className={cn(
                        "relative px-4 py-2 rounded-lg transition-all duration-300",
                        "hover:bg-white/20 dark:hover:bg-white/10",
                        isActive && "bg-white/30 dark:bg-white/20"
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon size={18} className={cn(
                          "transition-colors",
                          isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"
                        )} />
                        <span className={cn(
                          "text-sm font-medium transition-colors",
                          isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"
                        )}>
                          {item.label}
                        </span>
                      </div>
                      
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              {/* <GlassButton variant="ghost" size="sm" className="!p-2">
                <Bell size={18} />
              </GlassButton> */}
              
              <GlassButton variant="ghost" size="sm" className="!p-2">
                <User size={18} />
              </GlassButton>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="!p-2"
                >
                  {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          opacity: isMobileMenuOpen ? 1 : 0,
          height: isMobileMenuOpen ? "auto" : 0
        }}
        className="fixed top-16 left-0 right-0 z-30 md:hidden overflow-hidden backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-b border-white/20 dark:border-white/10"
      >
        <div className="px-4 py-2 space-y-1">
          {/* STEP 4: Render the filtered list here as well */}
          {accessibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300",
                    "hover:bg-white/20 dark:hover:bg-white/10",
                    isActive && "bg-white/30 dark:bg-white/20"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={20} className={cn(
                    "transition-colors",
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"
                  )} />
                  <span className={cn(
                    "font-medium transition-colors",
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"
                  )}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}