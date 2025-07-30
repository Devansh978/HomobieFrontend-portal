import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { X } from "lucide-react";
import { GlassButton } from "./glass-button";

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeStyles = {
  sm: "max-w-md",
  md: "max-w-lg", 
  lg: "max-w-2xl",
  xl: "max-w-4xl"
};

export function GlassModal({
  isOpen,
  onClose,
  children,
  title,
  className,
  size = "md"
}: GlassModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "relative w-full rounded-2xl backdrop-blur-xl",
              "bg-gradient-to-br from-white/90 via-white/80 to-white/70",
              "dark:from-gray-900/90 dark:via-gray-800/80 dark:to-gray-900/70",
              "border border-white/20 dark:border-white/10",
              "shadow-2xl",
              sizeStyles[size],
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glass reflection */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="!p-1"
                  >
                    <X size={18} />
                  </GlassButton>
                </div>
              )}
              
              {/* Content */}
              <div className="p-6">
                {children}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}