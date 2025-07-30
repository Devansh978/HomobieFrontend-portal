import {
  TrendingUp,
  TrendingDown,
  UserPlus,
  Handshake,
  Clock,
  IndianRupee,
  Users,
  CheckCircle,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { DashboardMetrics } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: React.ComponentType<any>;
  iconColor: string;
  index: number;
  prevValue?: string | number;
}

function useAnimatedCounter(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(end * progress));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}

function MetricCard({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  iconColor,
  index,
  prevValue,
}: MetricCardProps) {
  const [hasChanged, setHasChanged] = useState(false);
  
  // Animate counter for numeric values
  const numericValue = typeof value === 'number' ? value : 
    (typeof value === 'string' && value.includes('₹')) ? 
      parseInt(value.replace(/[₹,]/g, '')) : 0;
  
  const animatedValue = useAnimatedCounter(numericValue, 1500);
  const displayValue = typeof value === 'number' ? animatedValue : value;

  useEffect(() => {
    if (prevValue !== undefined && prevValue !== value) {
      setHasChanged(true);
      const timer = setTimeout(() => setHasChanged(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      <GlassCard 
        className="relative overflow-hidden"
        gradient="primary"
        blur="md"
        hover={true}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0"
          animate={{ opacity: hasChanged ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
        
        <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title}
          </h3>
          <motion.div 
            className={`p-2 rounded-lg ${iconColor} backdrop-blur-sm`}
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Icon className="h-4 w-4" />
          </motion.div>
        </div>
        
        <div className="px-6 pb-6">
          <motion.div 
            className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
            key={value}
            initial={{ scale: 1 }}
            animate={{ scale: hasChanged ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            {typeof value === 'string' && value.includes('₹') ? value : displayValue}
          </motion.div>
          
          <motion.p 
            className={`text-sm flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: hasChanged ? [0.8, 1, 0.8] : 0.8 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              animate={{ 
                rotate: isPositive ? 0 : 180,
                y: [0, -2, 0]
              }}
              transition={{ 
                rotate: { duration: 0.3 },
                y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <TrendingUp size={14} className="mr-1" />
            </motion.span>
            {change}
          </motion.p>
        </div>
        
        {/* Pulse effect for real-time updates */}
        <AnimatePresence>
          {hasChanged && (
            <motion.div
              className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.5, 0], 
                opacity: [0, 1, 0] 
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 1.5, 
                ease: "easeOut" 
              }}
            />
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}

// Loading skeleton component with glassmorphism effect
function LoadingSkeleton() {
  return (
    <GlassCard className="animate-pulse" gradient="neutral" blur="sm">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 bg-white/30 rounded w-24"></div>
          <div className="h-6 w-6 bg-white/30 rounded-full"></div>
        </div>
        <div className="h-8 bg-white/30 rounded mb-2"></div>
        <div className="h-4 bg-white/30 rounded w-3/4"></div>
      </div>
    </GlassCard>
  );
}

interface MetricsGridProps {
  metrics?: DashboardMetrics;
  isLoading?: boolean;
  previousMetrics?: DashboardMetrics;
}

export function GlassMetricsGrid({ metrics, isLoading, previousMetrics }: MetricsGridProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <LoadingSkeleton key={i} />
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('₹', '₹');
  };

  const metricItems = [
    {
      title: "New Leads",
      value: metrics.newLeads,
      change: "+20% from last month",
      isPositive: true,
      icon: UserPlus,
      iconColor: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      prevValue: previousMetrics?.newLeads,
    },
    {
      title: "Conversions",
      value: metrics.conversions,
      change: "+12% from last month",
      isPositive: true,
      icon: Handshake,
      iconColor: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      prevValue: previousMetrics?.conversions,
    },
    {
      title: "Pending Approvals",
      value: metrics.pendingApprovals,
      change: "-3% from last month",
      isPositive: false,
      icon: Clock,
      iconColor: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
      prevValue: previousMetrics?.pendingApprovals,
    },
    {
      title: "Total Loan Value",
      value: formatCurrency(metrics.totalLoanValue),
      change: "+15% from last month",
      isPositive: true,
      icon: IndianRupee,
      iconColor: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      prevValue: previousMetrics?.totalLoanValue,
    },
  ];

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {metricItems.map((metric, index) => (
        <MetricCard
          key={metric.title}
          {...metric}
          index={index}
        />
      ))}
    </motion.div>
  );
}