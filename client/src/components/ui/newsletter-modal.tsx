import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Gift, Sparkles } from "lucide-react";
import { GlassModal } from "./glass-modal";
import { GlassButton } from "./glass-button";
import { Input } from "./input";
import { useToast } from "@/hooks/use-toast";

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call - replace with actual Mailchimp integration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Successfully subscribed!",
        description: "You'll receive loan insights and exclusive offers in your inbox.",
      });
      
      setEmail("");
      onClose();
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      className="max-w-lg"
    >
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-xl"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
            >
              <Mail className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
            >
              Get Exclusive Loan Insights
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-gray-600 dark:text-gray-400"
            >
              Join 10,000+ users getting the latest loan rates, tips, and exclusive offers
            </motion.p>
          </div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-6 space-y-3"
          >
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Weekly market insights & rate updates</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Gift className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Exclusive deals & pre-approved offers</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Mail className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Tips to improve your loan eligibility</span>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="pl-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 focus:border-blue-400"
              />
            </div>

            <div className="flex space-x-3">
              <GlassButton
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Subscribing...
                  </div>
                ) : (
                  "Subscribe Now"
                )}
              </GlassButton>
              
              <GlassButton
                type="button"
                variant="ghost"
                onClick={onClose}
                className="px-4"
              >
                Maybe Later
              </GlassButton>
            </div>
          </motion.form>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4"
          >
            We respect your privacy. Unsubscribe at any time.
          </motion.p>
        </div>
      </div>
    </GlassModal>
  );
}

// Hook to automatically show newsletter modal
export function useNewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal after 10 seconds on first visit
    const hasSeenNewsletter = localStorage.getItem('hasSeenNewsletter');
    
    if (!hasSeenNewsletter) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenNewsletter', 'true');
  };

  return {
    isNewsletterOpen: isOpen,
    closeNewsletter: handleClose,
    openNewsletter: () => setIsOpen(true),
  };
}