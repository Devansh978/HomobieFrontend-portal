import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PulseAnimationProps {
  children: ReactNode;
  isActive?: boolean;
  intensity?: "low" | "medium" | "high";
  color?: string;
}

export function PulseAnimation({ 
  children, 
  isActive = false, 
  intensity = "medium",
  color = "rgb(59, 130, 246)" // blue-500
}: PulseAnimationProps) {
  const getAnimationProps = () => {
    switch (intensity) {
      case "low":
        return {
          scale: [1, 1.02, 1],
          boxShadow: [
            `0 0 0 0 ${color}40`,
            `0 0 0 4px ${color}20`,
            `0 0 0 0 ${color}00`
          ]
        };
      case "medium":
        return {
          scale: [1, 1.05, 1],
          boxShadow: [
            `0 0 0 0 ${color}60`,
            `0 0 0 8px ${color}30`,
            `0 0 0 0 ${color}00`
          ]
        };
      case "high":
        return {
          scale: [1, 1.08, 1],
          boxShadow: [
            `0 0 0 0 ${color}80`,
            `0 0 0 12px ${color}40`,
            `0 0 0 0 ${color}00`
          ]
        };
    }
  };

  if (!isActive) {
    return <>{children}</>;
  }

  return (
    <motion.div
      animate={getAnimationProps()}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="relative"
    >
      {children}
    </motion.div>
  );
}

interface DataUpdateIndicatorProps {
  isUpdating: boolean;
  children: ReactNode;
}

export function DataUpdateIndicator({ isUpdating, children }: DataUpdateIndicatorProps) {
  return (
    <div className="relative">
      {children}
      {isUpdating && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
        >
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-full h-full bg-green-400 rounded-full"
          />
        </motion.div>
      )}
    </div>
  );
}