import { useNavigate } from "react-router-dom"; // import at top
import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  User, 
  CreditCard, 
  Target, 
  DollarSign, 
  Clock, 
  FileText,
  Phone,
  Mail,
  Calendar,
  Home,
  TrendingUp,
  Bell,
  Settings
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EnhancedRoleBasedNavbar } from "@/components/layout/EnhancedRoleBasedNavbar";
import NewApplication from "@/components/dashboard/NewApplication";
import { useAuth } from "@/hooks/useAuth";
import type { LeadsResponse } from "@/types/api";

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);

  // const navigate = useNavigate(); // inside component

  const [form, setForm] = useState({
    loanType: '',
    amount: '',
    detail1: '',
    notes: '',
  });


  // Fetch user's leads
  const { data: leadsData = { leads: [], total: 0 } } = useQuery<LeadsResponse>({
    queryKey: ["/api/leads"],
    refetchInterval: 30000,
  });

  const myLeads = leadsData.leads.filter(lead => lead.assignedToId === user?.id);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const stats = [
    {
      title: "My Applications",
      value: myLeads.length,
      icon: FileText,
      change: "+2",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      title: "In Progress",
      value: myLeads.filter(lead => 
        lead.status === "under_review" || lead.status === "documents_requested"
      ).length,
      icon: Clock,
      change: "+1",
      gradient: "from-orange-500/20 to-amber-500/20",
    },
    {
      title: "Approved",
      value: myLeads.filter(lead => lead.status === "approved").length,
      icon: Target,
      change: "0",
      gradient: "from-emerald-500/20 to-teal-500/20",
    },
    {
      title: "Total Loan Value",
      value: `₹${myLeads.reduce((sum, lead) => sum + (lead.loanAmount || 0), 0).toLocaleString()}`,
      icon: DollarSign,
      change: "+15%",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
  ];

  const recentActivity = [
    { action: "Application Submitted", type: "Home Loan", amount: "₹45L", time: "2 hours ago", status: "new" },
    { action: "Document Upload", type: "Income Proof", amount: "", time: "1 day ago", status: "uploaded" },
    { action: "Status Update", type: "Under Review", amount: "", time: "2 days ago", status: "review" },
    { action: "Loan Approved", type: "Business Loan", amount: "₹25L", time: "1 week ago", status: "approved" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <EnhancedRoleBasedNavbar user={user} onLogout={logout} />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 p-4 md:p-6 space-y-6 md:space-y-8 pt-20 md:pt-24"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-indigo-100 to-white bg-clip-text text-transparent">
            My Dashboard
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto px-4">
            Track your loan applications, manage documents, and monitor progress
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <GlassCard gradient="neutral" blur="md" hover className="p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-300">{stat.title}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Application Progress */}
        <motion.div variants={itemVariants}>
          <GlassCard gradient="neutral" blur="md" className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Application Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Application Submitted</span>
                  <span className="text-emerald-400 font-semibold">100%</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Documents Verified</span>
                  <span className="text-blue-400 font-semibold">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Final Approval</span>
                  <span className="text-orange-400 font-semibold">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <GlassCard gradient="neutral" blur="md" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
                <Badge variant="outline" className="text-indigo-400 border-indigo-400">
                  {recentActivity.length} Activities
                </Badge>
              </div>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{activity.action}</p>
                        <p className="text-sm text-gray-300">{activity.type} {activity.amount}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        activity.status === "approved" ? "default" : 
                        activity.status === "review" ? "secondary" : "destructive"
                      } className="mb-1">
                        {activity.status}
                      </Badge>
                      <p className="text-xs text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Account Summary */}
          <motion.div variants={itemVariants}>
            <GlassCard gradient="neutral" blur="md" className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Account Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-indigo-400" />
                    <div>
                      <p className="text-white font-medium">Profile Status</p>
                      <p className="text-sm text-gray-300">Complete</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-100 border-emerald-500/30">
                    Verified
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">Documents</p>
                      <p className="text-sm text-gray-300">5 of 6 uploaded</p>
                    </div>
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-100 border-orange-500/30">
                    Pending
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-white font-medium">Credit Score</p>
                      <p className="text-sm text-gray-300">750 - Excellent</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-100 border-emerald-500/30">
                    Good
                  </Badge>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <GlassCard gradient="neutral" blur="md" className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* <Button className="h-16 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 hover:from-indigo-500/30 hover:to-blue-500/30">
                <FileText className="h-6 w-6 mr-2" />
                New Application
              </Button> */}
              <Button
                onClick={() => navigate("/new-application")}
                className="h-16 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 hover:from-indigo-500/30 hover:to-blue-500/30"
              >
                <FileText className="h-6 w-6 mr-2" />
                New Application
              </Button>
              <Button className="h-16 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 hover:from-emerald-500/30 hover:to-teal-500/30">
                <Phone className="h-6 w-6 mr-2" />
                Upload Documents
              </Button>
              {/* <Button className="h-16 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 hover:from-orange-500/30 hover:to-amber-500/30">
                <Calendar className="h-6 w-6 mr-2" />
                Schedule Meeting
              </Button> */}
              <Button className="h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30">
                <TrendingUp className="h-6 w-6 mr-2" />
                Check Status
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}