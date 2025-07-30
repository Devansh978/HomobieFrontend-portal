import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  Target,
  BarChart3,
  Plus,
  Search,
  PhoneCall,
  CheckCircle2,
  ListTodo,
  FileText,
  Settings,
  Download,
  Zap,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// --- UI Components (Assuming these are from your library, e.g., shadcn/ui) ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { EnhancedRoleBasedNavbar } from "@/components/layout/EnhancedRoleBasedNavbar";
import { EnhancedCreateProjectDialog } from "@/components/dashboard/EnhancedCreateProjectDialog";
import { EnhancedAssignLeadDialog } from "@/components/dashboard/EnhancedAssignLeadDialog";
import { CreateTeam } from "@/components/dashboard/CreateTeam";
// --- New Component Imports from your example ---
import { LeadManagementModal } from "@/components/leads/LeadManagementModal";
import { ChatbotWidget } from "@/components/dashboard/ChatbotWidget";


// --- API Configuration & Types ---
const API_BASE_URL = "https://homobiebackend-railway-production.up.railway.app";

// Generic types for data models
interface LocationResponse { city: string; state: string; }
interface ProjectResponse { projectId: string; projectName: string; location: LocationResponse; status: string; budget: number; units: number; }
interface TelecallerResponse { userId: string; firstName: string; lastName: string; email: string; status: string; totalCalls?: number; }
interface LeadResponse { leadId: string; firstName: string; lastName: string; email: string; loanType: string; loanAmount: number; status: string; }
interface CreateLeadForm { firstName: string; lastName: string; email: string; phone: string; loanType: string; loanAmount: number; }
interface DashboardMetrics { newLeads: number; pendingApprovals: number; conversions: number; totalLeads: number; }


// --- Main Dashboard Component ---
export default function RoleBasedAnimatedDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- State Management ---
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [dialogs, setDialogs] = useState({
    createProject: false,
    createTeam: false,
    assignLead: false,
    createLead: false,
  });

  const userRole = user?.role || "BUILDER"; // Default to BUILDER for demonstration

  // --- Reusable Authenticated Fetch ---
  const authenticatedFetch = async (url: string, options?: RequestInit) => {
    const token = localStorage.getItem("auth_token");
    if (!token) throw new Error("Authentication token not found.");
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API request failed: ${response.statusText}`);
    }
    return response.json();
  };

  // --- Data Fetching with Real-time Polling ---
  const { data: metrics, isLoading: metricsLoading, isFetching: metricsRefreshing } = useQuery<DashboardMetrics>({
    queryKey: ["dashboardMetrics", user?.userId],
    queryFn: async () => {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/dashboard/metrics`);
      setLastUpdate(new Date());
      return response;
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    enabled: !!user,
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<ProjectResponse[]>({
    queryKey: ["projects", user?.userId],
    queryFn: () => {
      if (!user) throw new Error("User not found");
      return authenticatedFetch(`${API_BASE_URL}/project/get/${user.userId}`);
    },
    enabled: userRole === "BUILDER" && !!user?.userId,
  });

  const { data: team = [], isLoading: teamLoading } = useQuery<TelecallerResponse[]>({
    queryKey: ["team", user?.userId],
    queryFn: () => authenticatedFetch(`${API_BASE_URL}/api/team/builder/${user.userId}`),
    enabled: userRole === "BUILDER" && !!user?.userId,
  });

  const { data: unassignedLeads = [], isLoading: leadsLoading } = useQuery<LeadResponse[]>({
    queryKey: ["unassignedLeads"],
    queryFn: () => authenticatedFetch(`${API_BASE_URL}/leads/unassigned`),
    enabled: userRole === "BUILDER",
    refetchInterval: 30000,
  });
  
  const { data: assignedLeads = [], isLoading: assignedLeadsLoading, refetch: refetchLeads } = useQuery<LeadResponse[]>({
    queryKey: ["assignedLeads", user?.userId],
    queryFn: () => authenticatedFetch(`${API_BASE_URL}/leads/assigned/${user.userId}`),
    enabled: userRole === "TELECALLER" && !!user?.userId,
    refetchInterval: 30000,
  });

  // --- Core Logic ---
  const handleCreateLead = async (data: CreateLeadForm) => {
    try {
      await authenticatedFetch("/api/leads", {
        method: "POST",
        body: JSON.stringify(data),
      });
      toast({
        title: "Lead Created Successfully",
        description: `Lead for ${data.firstName} ${data.lastName} has been added.`,
      });
      setDialogs(d => ({ ...d, createLead: false }));
      queryClient.invalidateQueries({ queryKey: ["unassignedLeads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
    } catch (error) {
      toast({
        title: "Error Creating Lead",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  // --- UI Configuration based on Role ---
  const dashboardConfig = getDashboardConfig({
      userRole,
      projects,
      team,
      unassignedLeads,
      assignedLeads,
      metrics,
      setDialogs,
      toast
  });

  // --- Animation Variants ---
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } } };

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-black relative overflow-hidden">
        <div className="absolute inset-0 z-0"><div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(0,255,150,0.15),rgba(255,255,255,0))]"></div><div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(0,150,255,0.15),rgba(255,255,255,0))]"></div></div>
        <EnhancedRoleBasedNavbar user={user} onLogout={logout} />
        
        <main className="relative z-10 p-4 md:p-6 lg:p-8 pt-24 space-y-6">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <Header title={dashboardConfig.title} subtitle={dashboardConfig.subtitle} />
              <RealTimeIndicator isConnected={!metricsLoading} lastUpdate={lastUpdate} isRefreshing={metricsRefreshing} />
            </motion.div>

            <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <GlassMetricsGrid metrics={dashboardConfig.metrics} isLoading={metricsLoading} />
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2">{dashboardConfig.mainView({ projects, projectsLoading, searchTerm, setSearchTerm, setDialogs, assignedLeads, assignedLeadsLoading })}</div>
              
              <div className="space-y-6">
                <QuickActions actions={dashboardConfig.quickActions} />
                <TimelineActivity />
                <CRMIntegrationStatus />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalyticsCard title="Lead Conversion Funnel">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">New Leads</span><span className="text-sm font-medium">{metrics?.newLeads ?? 0}</span></div>
                        <div className="flex items-center justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Under Review</span><span className="text-sm font-medium">{metrics?.pendingApprovals ?? 0}</span></div>
                        <div className="flex items-center justify-between"><span className="text-sm font-medium text-emerald-500">Approved</span><span className="text-sm font-bold text-emerald-500">{metrics?.conversions ?? 0}</span></div>
                    </div>
                </AnalyticsCard>
                <AnalyticsCard title="System Overview">
                   <div className="space-y-3">
                        <div className="flex items-center justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Total Leads in System</span><span className="text-sm font-medium">{metrics?.totalLeads ?? 0}</span></div>
                        <div className="flex items-center justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span><span className="text-sm font-medium">12</span></div>
                        <div className="flex items-center justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">System Status</span><span className="text-sm font-medium text-green-500">Operational</span></div>
                    </div>
                </AnalyticsCard>
            </motion.div>
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
        {dialogs.createProject && userRole === 'BUILDER' && <EnhancedCreateProjectDialog open={dialogs.createProject} onOpenChange={(isOpen) => setDialogs(d => ({ ...d, createProject: isOpen }))} />}
        {dialogs.createTeam && userRole === 'BUILDER' && <CreateTeam open={dialogs.createTeam} onOpenChange={(isOpen) => setDialogs(d => ({ ...d, createTeam: isOpen }))} />}
        {dialogs.assignLead && userRole === 'BUILDER' && <EnhancedAssignLeadDialog open={dialogs.assignLead} onOpenChange={(isOpen) => setDialogs(d => ({ ...d, assignLead: isOpen }))} selectedLeads={unassignedLeads} telecallers={team} />}
        {dialogs.createLead && <LeadManagementModal isOpen={dialogs.createLead} onClose={() => setDialogs(d => ({...d, createLead: false}))} onSubmit={handleCreateLead} mode="create" />}
      </AnimatePresence>
      <ChatbotWidget />
    </>
  );
}

// --- Helper for generating Role-Based Config ---
const getDashboardConfig = ({ userRole, projects, team, unassignedLeads, assignedLeads, metrics, setDialogs, toast }) => {
  const baseConfig = { title: "Dashboard", subtitle: "Welcome!", metrics: [], quickActions: [], mainView: () => <></> };

  if (userRole === "BUILDER") {
    return {
      ...baseConfig,
      title: "Builder Dashboard",
      subtitle: "Manage your projects, team, and leads from one place.",
      metrics: [
        { title: "Active Projects", value: projects.filter(p => p.status === "Active").length, icon: Building2 },
        { title: "Team Members", value: team.length, icon: Users },
        { title: "Unassigned Leads", value: unassignedLeads.length, icon: Target },
        { title: "Total Conversions", value: metrics?.conversions ?? 0, icon: CheckCircle2 },
      ],
      quickActions: [
        { title: "Create Lead", description: "Add a new potential customer.", icon: Plus, action: () => setDialogs(d => ({ ...d, createLead: true })) },
        { title: "New Project", description: "Launch a new project.", icon: Building2, action: () => setDialogs(d => ({ ...d, createProject: true })) },
        { title: "Assign Leads", description: "Distribute new leads.", icon: ListTodo, action: () => setDialogs(d => ({ ...d, assignLead: true })) },
        { title: "Export Reports", description: "Download project data.", icon: Download, action: () => toast({ title: "Coming Soon!", description: "Reporting feature is under development." }) },
      ],
      mainView: (props) => <ProjectsView {...props} />,
    };
  }

  if (userRole === "TELECALLER") {
    return {
      ...baseConfig,
      title: "Telecaller Dashboard",
      subtitle: "Focus on your assigned leads and track your progress.",
      metrics: [
        { title: "Assigned Leads", value: assignedLeads.length, icon: Target },
        { title: "Calls Today", value: 42, icon: PhoneCall },
        { title: "My Conversions", value: 5, icon: CheckCircle2 },
        { title: "Pending Follow-ups", value: 12, icon: ListTodo },
      ],
      quickActions: [
        { title: "Log a Call", description: "Manually add a call record.", icon: Plus, action: () => {} },
        { title: "Workflow Settings", description: "Adjust your process.", icon: Settings, action: () => {} },
        { title: "Request Help", description: "Get assistance from a manager.", icon: FileText, action: () => {} },
      ],
      mainView: (props) => <LeadsView {...props} />,
    };
  }
  return baseConfig;
};


// --- Placeholder & Reusable View Components ---
const GlassCard = ({ children, className = '' }) => (
    <Card className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-800 ${className}`}>
        {children}
    </Card>
);
const Header = ({ title, subtitle }) => (
    <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
    </div>
);
const RealTimeIndicator = ({ isConnected, lastUpdate, isRefreshing }) => (
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2 md:mt-0">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span>{isConnected ? "Live" : "Disconnected"}</span>
        <span className="text-xs">| Last update: {lastUpdate.toLocaleTimeString()}</span>
        {isRefreshing && <RefreshCw className="h-3 w-3 animate-spin" />}
    </div>
);
const GlassMetricsGrid = ({ metrics, isLoading }) => (
    <>
        {metrics.map((stat) => (
            <GlassCard key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{isLoading ? '...' : stat.value}</div>
                </CardContent>
            </GlassCard>
        ))}
    </>
);
const QuickActions = ({ actions }) => (
    <GlassCard>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
            {actions.map((action) => (
                <motion.div key={action.title} whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <div className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer transition-colors" onClick={action.action}>
                        <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg mr-4 border dark:border-slate-700"><action.icon className="h-5 w-5 text-gray-700 dark:text-gray-200" /></div>
                        <div>
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{action.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </CardContent>
    </GlassCard>
);
const TimelineActivity = () => (
    <GlassCard>
        <CardHeader><CardTitle>Timeline</CardTitle><CardDescription>Recent activity across projects.</CardDescription></CardHeader>
        <CardContent className="text-center text-sm text-gray-500 py-8">Timeline component coming soon.</CardContent>
    </GlassCard>
);
const CRMIntegrationStatus = () => (
    <GlassCard>
        <CardHeader><CardTitle>CRM Status</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-green-500" />
            <div>
                <p className="text-sm font-medium">All systems operational.</p>
                <p className="text-xs text-gray-500">CRM sync active.</p>
            </div>
        </CardContent>
    </GlassCard>
);
const AnalyticsCard = ({ title, children }) => (
    <GlassCard>
        <CardHeader><h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3></CardHeader>
        <CardContent>{children}</CardContent>
    </GlassCard>
);

const ProjectsView = ({ projects, isLoading, searchTerm, setSearchTerm, setDialogs }) => (
  <GlassCard className="h-full">
    <CardHeader>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div><CardTitle>Projects Overview</CardTitle><CardDescription>Search, view, and manage your projects.</CardDescription></div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search by name or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-white/50 dark:bg-slate-800/50" />
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <ProjectSkeleton key={i} />) : 
            projects.filter(p => p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || `${p.location.city}, ${p.location.state}`.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((project, i) => (
              <motion.div key={project.projectId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{project.projectName}</CardTitle>
                      <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>{project.status}</Badge>
                    </div>
                    <CardDescription>{project.location.city}, {project.location.state}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Units: {project.units}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{project.budget.toLocaleString()}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>
    </CardContent>
  </GlassCard>
);

const LeadsView = ({ assignedLeads, isLoading }) => (
  <GlassCard>
    <CardHeader><CardTitle>My Assigned Leads</CardTitle><CardDescription>These are the leads that require your attention.</CardDescription></CardHeader>
    <CardContent className="space-y-3">
      {isLoading ? Array.from({ length: 5 }).map((_, i) => <LeadSkeleton key={i} />) : 
        assignedLeads.map((lead, i) => (
          <motion.div key={lead.leadId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/40 rounded-lg border dark:border-slate-700">
            <div className="flex items-center space-x-4">
              <div><p className="font-medium text-gray-800 dark:text-gray-100">{lead.firstName} {lead.lastName}</p><p className="text-sm text-gray-500 dark:text-gray-400">{lead.email}</p></div>
            </div>
            <div className="flex items-center space-x-3"><Badge variant="outline">{lead.loanType}</Badge><Button size="sm" variant="ghost">View</Button></div>
          </motion.div>
        ))}
    </CardContent>
  </GlassCard>
);

const ProjectSkeleton = () => (<Card className="bg-gray-100 dark:bg-slate-800/50 animate-pulse"><CardHeader><div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mt-2"></div></CardHeader><CardContent className="flex justify-between items-center"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div></CardContent></Card>);
const LeadSkeleton = () => (<div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-slate-800/50 rounded-lg animate-pulse"><div className="flex items-center space-x-4"><div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700"></div><div className="space-y-2"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32"></div><div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-40"></div></div></div><div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-20"></div></div>);