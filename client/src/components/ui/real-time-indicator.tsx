import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

interface RealTimeIndicatorProps {
  isConnected: boolean;
  lastUpdate?: Date;
  isRefreshing?: boolean;
}

export function RealTimeIndicator({ 
  isConnected, 
  lastUpdate, 
  isRefreshing = false 
}: RealTimeIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    if (!lastUpdate) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
      
      if (diff < 60) {
        setTimeAgo("Just now");
      } else if (diff < 3600) {
        setTimeAgo(`${Math.floor(diff / 60)}m ago`);
      } else {
        setTimeAgo(`${Math.floor(diff / 3600)}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center space-x-2 text-xs text-gray-500"
    >
      <motion.div
        animate={{
          scale: isRefreshing ? [1, 1.2, 1] : 1,
          rotate: isRefreshing ? 360 : 0,
        }}
        transition={{
          scale: { duration: 1, repeat: isRefreshing ? Infinity : 0 },
          rotate: { duration: 2, repeat: isRefreshing ? Infinity : 0, ease: "linear" },
        }}
      >
        {isConnected ? (
          <Wifi className="w-3 h-3 text-green-500" />
        ) : (
          <WifiOff className="w-3 h-3 text-red-500" />
        )}
      </motion.div>
      
      <AnimatePresence mode="wait">
        <motion.span
          key={timeAgo}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          {isRefreshing ? "Updating..." : `Updated ${timeAgo}`}
        </motion.span>
      </AnimatePresence>
      
      {isConnected && (
        <motion.div
          className="flex space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-green-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}