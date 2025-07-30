import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "accent" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const variantStyles = {
  primary: "bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-blue-400/30 text-blue-900 dark:text-blue-100 hover:from-blue-500/30 hover:to-purple-600/30",
  secondary: "bg-gradient-to-r from-emerald-500/20 to-teal-600/20 border-emerald-400/30 text-emerald-900 dark:text-emerald-100 hover:from-emerald-500/30 hover:to-teal-600/30",
  accent: "bg-gradient-to-r from-pink-500/20 to-rose-600/20 border-pink-400/30 text-pink-900 dark:text-pink-100 hover:from-pink-500/30 hover:to-rose-600/30",
  ghost: "bg-white/10 border-white/20 text-gray-800 dark:text-white hover:bg-white/20"
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg"
};

export function GlassButton({
  children,
  onClick,
  className,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button"
}: GlassButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative rounded-lg backdrop-blur-md border font-medium transition-all duration-300",
        "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        "shadow-lg hover:shadow-xl",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Glass reflection */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}