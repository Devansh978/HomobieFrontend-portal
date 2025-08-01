import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassBackground } from "@/components/layout/GlassBackground";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
// Corrected the image import to be a default import
import HomobieLogo from "/attached_assets/wmremove-transformed_-_Edited-removebg-preview.png";

// Define UserRole type if not imported from elsewhere
type UserRole =
  | "super_admin"
  | "admin"
  | "builder"
  | "telecaller"
  | "broker"
  | "ca"
  | "user";

export default function GlassLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [formData, setFormData] = useState<{
    username: string;
    password: string;
  }>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Removed the isDemoLoading state
  // const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const response = await login({
        username: formData.username,
        password: formData.password,
      });

      if ("email" in response) {
        toast({
          title: "Welcome back!",
          description: `Logged in as ${response.email}`,
          duration: 5000,
        });

        // Convert role to lowercase for consistency with UserRole type
        const role = response.role.toLowerCase() as UserRole;
        RoleBasedRedirect(role);
      }
    } catch (err: any) {
      handleLoginError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const RoleBasedRedirect = (role: string) => {
    const roleRoutes: Record<string, string> = {
      super_admin: "/admin",
      admin: "/admin",
      builder: "/builder",
      telecaller: "/telecaller",
      broker: "/broker",
      ca: "/ca/portfolio",
      user: "/dashboard",
    };

    // Convert role to lowercase to match keys
    const normalizedRole = role.toLowerCase();
    setLocation(roleRoutes[normalizedRole] || "/dashboard");
  };

  const handleLoginError = (err: any) => {
    console.error("Login error:", err);

    let errorMessage = "Login failed. Please try again.";

    if (err?.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err?.message) {
      if (
        err.message.includes("credentials") ||
        err.message.includes("Invalid")
      ) {
        errorMessage = "Invalid username or password";
      } else if (
        err.message.includes("network") ||
        err.message.includes("fetch")
      ) {
        errorMessage = "Network error. Please check your connection.";
      } else if (err.message.includes("timeout")) {
        errorMessage = "Request timeout. Please try again.";
      } else {
        errorMessage = err.message;
      }
    }

    setError(errorMessage);
    setFormData((prev) => ({ ...prev, password: "" }));

    toast({
      title: "Login failed",
      description: errorMessage,
      variant: "destructive",
      duration: 5000,
    });
  };

  // Removed the handleDemoLogin function

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) {
      setError(null);
    }

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <GlassBackground />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20 + Math.random() * 40, 0],
              x: [0, -10 + Math.random() * 20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-6 py-12"
      >
        <GlassCard
          gradient="primary"
          blur="xl"
          className="p-8 relative overflow-hidden"
        >
          <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl" />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8"
          >
            {/* Correctly rendered the logo with proper src and styling */}
            <img
              src={HomobieLogo}
              alt="Company Logo"
              className="mx-auto h-24 w-auto mb-4"
            />

            <h1 className="text-3xl font-bold text-gradient-primary mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to access your account
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center"
            >
              <AlertCircle className="text-red-500 mr-2 h-5 w-5" />
              <span className="text-red-500 text-sm">{error}</span>
            </motion.div>
          )}

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Username or Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="username@example.com"
                  required
                  className="pl-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-blue-400 transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Link href="/forgot-password">
                  <span className="text-sm text-gradient-primary hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="pl-10 pr-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-blue-400 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Remember me
                </label>
              </div>

              <GlassButton
                type="submit"
                variant="primary"
                size="md"
                disabled={isLoading}
                className={cn(
                  "w-32 justify-center",
                  isLoading && "opacity-80 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Signing In
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </GlassButton>
            </div>
          </motion.form>

          {/* Removed the 'or' divider and the demo button */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 text-center text-sm"
          >
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link href="/register">
                <span className="text-gradient-primary font-medium hover:underline cursor-pointer">
                  Sign up
                </span>
              </Link>
            </p>
          </motion.div>
        </GlassCard>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-6 text-center text-xs text-gray-500"
        >
          <p>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
