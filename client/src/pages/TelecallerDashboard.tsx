import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Phone, Target, Clock, CheckCircle, AlertTriangle, Users, TrendingUp, Award } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
// import { RoleBasedNavbar } from "@/components/layout/RoleBasedNavbar";
import { useAuth } from "@/hooks/useAuth";
import type { LeadsResponse, Lead } from "@/types/api";

export default function TelecallerDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch assigned leads
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
      title: "Total Calls Today",
      value: 24,
      icon: Phone,
      change: "+12%",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      title: "Assigned Leads",
      value: myLeads.length,
      icon: Target,
      change: "+8%",
      gradient: "from-emerald-500/20 to-teal-500/20",
    },
    {
      title: "Successful Calls",
      value: 18,
      icon: CheckCircle,
      change: "+15%",
      gradient: "from-green-500/20 to-emerald-500/20",
    },
    {
      title: "Conversion Rate",
      value: "75%",
      icon: TrendingUp,
      change: "+5%",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <RoleBasedNavbar user={user} onLogout={logout} />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 p-4 md:p-6 space-y-6 md:space-y-8 pt-20 md:pt-24"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            Telecaller Portal
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Manage your leads, track calls, and monitor performance
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
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

        {/* Performance Overview */}
        <motion.div variants={itemVariants}>
          <GlassCard gradient="neutral" blur="md" className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Today's Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Call Success Rate</span>
                  <span className="text-emerald-400 font-semibold">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Lead Conversion</span>
                  <span className="text-blue-400 font-semibold">60%</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Daily Target</span>
                  <span className="text-purple-400 font-semibold">80%</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Assigned Leads */}
        <motion.div variants={itemVariants}>
          <GlassCard gradient="neutral" blur="md" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Assigned Leads</h3>
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                {myLeads.length} Active
              </Badge>
            </div>
            <div className="space-y-3">
              {myLeads.slice(0, 5).map((lead) => (
                <motion.div
                  key={lead.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {lead.firstName[0]}{lead.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{lead.firstName} {lead.lastName}</p>
                      <p className="text-sm text-gray-300">{lead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={lead.status === "new" ? "destructive" : "secondary"}>
                      {lead.status}
                    </Badge>
                    <Button size="sm" className="bg-blue-500/20 hover:bg-blue-500/30">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <GlassCard gradient="neutral" blur="md" className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:from-blue-500/30 hover:to-cyan-500/30">
                <Phone className="h-6 w-6 mr-2" />
                Start Calling
              </Button>
              <Button className="h-16 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 hover:from-emerald-500/30 hover:to-teal-500/30">
                <Target className="h-6 w-6 mr-2" />
                View All Leads
              </Button>
              <Button className="h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30">
                <Award className="h-6 w-6 mr-2" />
                Performance Report
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}