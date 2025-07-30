import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  blur?: "sm" | "md" | "lg" | "xl";
  gradient?: "primary" | "secondary" | "accent" | "neutral";
  border?: boolean;
  shadow?: "sm" | "md" | "lg" | "xl";
}

const blurVariants = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md", 
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl"
};

const gradientVariants = {
  primary: "bg-gradient-to-br from-white/20 via-white/10 to-transparent",
  secondary: "bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent",
  accent: "bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent",
  neutral: "bg-gradient-to-br from-gray-500/20 via-slate-500/10 to-transparent"
};

const shadowVariants = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg", 
  xl: "shadow-xl"
};

export function GlassCard({ 
  children, 
  className, 
  hover = true,
  blur = "md",
  gradient = "primary",
  border = true,
  shadow = "lg"
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "relative rounded-xl overflow-hidden",
        blurVariants[blur],
        gradientVariants[gradient],
        shadowVariants[shadow],
        border && "border border-white/20",
        hover && "transition-all duration-300 hover:bg-white/25 hover:shadow-2xl hover:scale-[1.02]",
        "dark:border-white/10 dark:shadow-black/20",
        className
      )}
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Glass reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Subtle inner glow */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}