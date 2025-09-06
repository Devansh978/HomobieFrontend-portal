import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Users,
  Target,
  BarChart3,
  Plus,
  Search,
} from "lucide-react";

// --- UI Components ---
// Assuming these are standard shadcn/ui components
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

// --- Hooks and Services ---
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// --- Layout & Dialog Components ---
import { EnhancedRoleBasedNavbar } from "@/components/layout/EnhancedRoleBasedNavbar";
import { EnhancedCreateProjectDialog } from "@/components/dashboard/EnhancedCreateProjectDialog";
import { EnhancedAssignLeadDialog } from "@/components/dashboard/EnhancedAssignLeadDialog";
import { CreateTeam } from "@/components/dashboard/CreateTeam";

// --- API and Types ---
const API_BASE_URL = "http://homobie.ap-south-1.elasticbeanstalk.com";

// Types matching backend DTOs
interface LocationResponse {
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

interface ProjectResponse {
  projectName: string;
  location: LocationResponse;
  status: string;
  projectType: string;
  projectId: string;
  budget: number;
  units: number;
  completedAt?: string;
}

interface TelecallerResponse {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  totalCalls: number;
}

interface LeadResponse {
  leadId: string;
  firstName: string;
  lastName: string;
  email: string;
  loanType: string;
  loanAmount: number;
  status: string;
}

// --- Main Dashboard Component ---
export default function ThemedBuilderDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showAssignLead, setShowAssignLead] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<LeadResponse[]>([]);
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const userId = user?.userId || "null";
  const token = localStorage.getItem("auth_token") || "";
  
  // Reusable authenticated fetch function
  const authenticatedFetch = async (url: string) => {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Network response was not ok for ${url}`);
    }
    return response.json();
  };

  // --- Data Queries ---
  const { data: projects = [], isLoading: projectsLoading } = useQuery<ProjectResponse[]>({
    queryKey: ["builderProjects", userId],
    queryFn: () => authenticatedFetch(`${API_BASE_URL}/project/get/${userId}`),
    enabled: !!userId && !!token,
  });

  const { data: telecallers = [], isLoading: telecallersLoading } = useQuery<TelecallerResponse[]>({
    queryKey: ["builderTelecallers", userId],
    // Assuming an endpoint to get team members for a builder
    queryFn: () => authenticatedFetch(`${API_BASE_URL}/api/team/builder/${userId}`),
    enabled: !!userId && !!token,
  });

  const { data: leads = [], isLoading: leadsLoading } = useQuery<LeadResponse[]>({
    queryKey: ["builderLeads"],
    // Assuming an endpoint to get unassigned leads relevant to the builder
    queryFn: () => authenticatedFetch(`${API_BASE_URL}/leads/unassigned`),
    enabled: !!token,
  });

  // --- Derived Data for UI ---
  const stats = [
    {
      title: "Active Projects",
      value: projects.filter((p) => p.status === "Active").length,
      icon: Building2,
    },
    {
      title: "Team Members",
      value: telecallers.length,
      icon: Users,
    },
    {
      title: "Unassigned Leads",
      value: leads.filter((l) => l.status === "new").length,
      icon: Target,
    },
    {
      title: "Completed Projects",
      value: projects.filter((p) => p.status === "completed").length,
      icon: BarChart3,
    },
  ];

  const quickActions = [
    {
      title: "Create New Project",
      description: "Start a new construction project.",
      icon: Building2,
      action: () => setShowCreateProject(true),
    },
    {
      title: "Add Team Member",
      description: "Invite telecallers to your team.",
      icon: Users,
      action: () => setShowCreateTeam(true),
    },
    {
      title: "Assign Leads",
      description: "Distribute leads to your team.",
      icon: Target,
      action: () => {
        const unassigned = leads.filter((l) => l.status === "new");
        setSelectedLeads(unassigned);
        setShowAssignLead(true);
      },
    },
  ];

  const formatLocation = (location: LocationResponse) => `${location.city}, ${location.state}`;
  
  const filteredProjects = projects.filter(
    (project) =>
      project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatLocation(project.location).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <EnhancedRoleBasedNavbar
          user={
            user
              ? {
                  id: Number(user.userId),
                  username: `${user.firstName} ${user.lastName || ""}`.trim(),
                  ...user,
                }
              : null
          }
          onLogout={logout}
        />
        <main className="p-4 md:p-8 pt-20 md:pt-24 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Builder Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Here's an overview of your projects, team, and leads.
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projectsLoading ? "..." : stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Projects */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <CardTitle>All Projects</CardTitle>
                      <CardDescription>
                        Search and manage your construction projects.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                       <div className="relative w-full sm:w-64">
                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                         <Input
                           placeholder="Search projects..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="pl-10"
                         />
                       </div>
                       <Button onClick={() => setShowCreateProject(true)} className="flex-shrink-0">
                         <Plus className="h-4 w-4 mr-2" />
                         New
                       </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projectsLoading ? (
                      <p>Loading projects...</p>
                    ) : (
                      filteredProjects.map((project) => (
                        <Card key={project.projectId} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base">{project.projectName}</CardTitle>
                              <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>{project.status}</Badge>
                            </div>
                            <CardDescription>{formatLocation(project.location)}</CardDescription>
                          </CardHeader>
                          <CardContent className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Units: {project.units}</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              ₹{project.budget.toLocaleString()}
                            </span>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column: Quick Actions & Team */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickActions.map((action) => (
                    <div key={action.title}
                      className="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer"
                      onClick={action.action}>
                        <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg mr-4">
                            <action.icon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">{action.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
                        </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Your active telecaller team.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                  {telecallersLoading ? <p>Loading team...</p> : telecallers.slice(0, 5).map(tc => (
                      <div key={tc.userId} className="flex items-center">
                        <div className="w-9 h-9 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-semibold text-white">
                                {tc.firstName[0]}{tc.lastName[0]}
                            </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-none">{tc.firstName} {tc.lastName}</p>
                          <p className="text-sm text-muted-foreground">{tc.email}</p>
                        </div>
                        <Badge variant={tc.status === 'active' ? 'default' : 'secondary'}>{tc.status}</Badge>
                      </div>
                  ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <EnhancedCreateProjectDialog
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
      />
      <CreateTeam open={showCreateTeam} onOpenChange={setShowCreateTeam} />
      <EnhancedAssignLeadDialog
        open={showAssignLead}
        onOpenChange={setShowAssignLead}
        selectedLeads={selectedLeads}
        // Assuming you need to pass telecallers to the dialog to assign leads
        telecallers={telecallers} 
      />
    </>
  );
}