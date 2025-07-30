import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Building, 
  Target, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  UserPlus,
  Settings,
  BarChart3,
  Calendar
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassModal } from "@/components/ui/glass-modal";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Telecaller {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "active" | "busy" | "offline" | "break";
  assignedProjects: Project[];
  assignedBanks: Bank[];
  performance: {
    totalCalls: number;
    successfulCalls: number;
    leadsGenerated: number;
    conversions: number;
    efficiency: number;
  };
  workingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  joinedAt: string;
}

interface Project {
  id: number;
  name: string;
  location: string;
  type: string;
  builder: string;
  priority: "high" | "medium" | "low";
}

interface Bank {
  id: number;
  name: string;
  type: string;
  products: string[];
  contactPerson: string;
  priority: "high" | "medium" | "low";
}

export default function TelecallerPortal() {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTelecaller, setSelectedTelecaller] = useState<Telecaller | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "telecaller",
    workingHours: { start: "09:00", end: "18:00", timezone: "IST" }
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch telecallers
  const { data: telecallers = [], isLoading: telecallersLoading } = useQuery<Telecaller[]>({
    queryKey: ["/api/telecallers", { search: searchQuery, status: statusFilter }],
    queryFn: async () => {
      // Mock data for demonstration - replace with actual API
      return [
        {
          id: 1,
          name: "Priya Sharma",
          email: "priya.sharma@company.com",
          phone: "+91 98765 43210",
          role: "Senior Telecaller",
          status: "active",
          assignedProjects: [
            { id: 1, name: "Skyline Residency", location: "Gurgaon", type: "Residential", builder: "ABC Builders", priority: "high" },
            { id: 2, name: "Metro Square", location: "Mumbai", type: "Commercial", builder: "XYZ Developers", priority: "medium" }
          ],
          assignedBanks: [
            { id: 1, name: "HDFC Bank", type: "Private", products: ["Home Loan", "LAP"], contactPerson: "Rajesh Kumar", priority: "high" },
            { id: 2, name: "SBI", type: "Public", products: ["Home Loan", "Business Loan"], contactPerson: "Sunita Patel", priority: "medium" }
          ],
          performance: {
            totalCalls: 250,
            successfulCalls: 180,
            leadsGenerated: 45,
            conversions: 12,
            efficiency: 72
          },
          workingHours: { start: "09:00", end: "18:00", timezone: "IST" },
          joinedAt: "2023-06-15T00:00:00Z"
        },
        {
          id: 2,
          name: "Rahul Kumar",
          email: "rahul.kumar@company.com",
          phone: "+91 87654 32109",
          role: "Telecaller",
          status: "busy",
          assignedProjects: [
            { id: 3, name: "Green Valley Homes", location: "Pune", type: "Residential", builder: "DEF Construction", priority: "medium" }
          ],
          assignedBanks: [
            { id: 3, name: "ICICI Bank", type: "Private", products: ["Home Loan"], contactPerson: "Amit Singh", priority: "high" }
          ],
          performance: {
            totalCalls: 180,
            successfulCalls: 125,
            leadsGenerated: 32,
            conversions: 8,
            efficiency: 69
          },
          workingHours: { start: "10:00", end: "19:00", timezone: "IST" },
          joinedAt: "2023-08-20T00:00:00Z"
        },
        {
          id: 3,
          name: "Sneha Patel",
          email: "sneha.patel@company.com",
          phone: "+91 76543 21098",
          role: "Senior Telecaller",
          status: "active",
          assignedProjects: [
            { id: 1, name: "Skyline Residency", location: "Gurgaon", type: "Residential", builder: "ABC Builders", priority: "high" },
            { id: 4, name: "Tech Park Plaza", location: "Bangalore", type: "Commercial", builder: "GHI Developers", priority: "low" }
          ],
          assignedBanks: [
            { id: 4, name: "Axis Bank", type: "Private", products: ["Home Loan", "LAP", "Business Loan"], contactPerson: "Meera Shah", priority: "high" },
            { id: 1, name: "HDFC Bank", type: "Private", products: ["Home Loan", "LAP"], contactPerson: "Rajesh Kumar", priority: "high" }
          ],
          performance: {
            totalCalls: 320,
            successfulCalls: 245,
            leadsGenerated: 67,
            conversions: 18,
            efficiency: 76
          },
          workingHours: { start: "08:30", end: "17:30", timezone: "IST" },
          joinedAt: "2023-05-10T00:00:00Z"
        }
      ];
    },
    refetchInterval: 30000,
  });

  // Fetch available projects and banks for assignment
  const { data: availableProjects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects/available"],
    queryFn: async () => {
      return [
        { id: 1, name: "Skyline Residency", location: "Gurgaon", type: "Residential", builder: "ABC Builders", priority: "high" },
        { id: 2, name: "Metro Square", location: "Mumbai", type: "Commercial", builder: "XYZ Developers", priority: "medium" },
        { id: 3, name: "Green Valley Homes", location: "Pune", type: "Residential", builder: "DEF Construction", priority: "medium" },
        { id: 4, name: "Tech Park Plaza", location: "Bangalore", type: "Commercial", builder: "GHI Developers", priority: "low" }
      ];
    },
  });

  const { data: availableBanks = [] } = useQuery<Bank[]>({
    queryKey: ["/api/banks/available"],
    queryFn: async () => {
      return [
        { id: 1, name: "HDFC Bank", type: "Private", products: ["Home Loan", "LAP"], contactPerson: "Rajesh Kumar", priority: "high" },
        { id: 2, name: "SBI", type: "Public", products: ["Home Loan", "Business Loan"], contactPerson: "Sunita Patel", priority: "medium" },
        { id: 3, name: "ICICI Bank", type: "Private", products: ["Home Loan"], contactPerson: "Amit Singh", priority: "high" },
        { id: 4, name: "Axis Bank", type: "Private", products: ["Home Loan", "LAP", "Business Loan"], contactPerson: "Meera Shah", priority: "high" }
      ];
    },
  });

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      return apiRequest("/api/telecallers", {
        method: "POST",
        body: JSON.stringify(userData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/telecallers"] });
      setIsAddUserModalOpen(false);
      setNewUser({ name: "", email: "", phone: "", role: "telecaller", workingHours: { start: "09:00", end: "18:00", timezone: "IST" } });
      toast({
        title: "User added successfully",
        description: "The new telecaller has been added to the system.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add user",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const filteredTelecallers = telecallers.filter(telecaller => {
    const matchesSearch = telecaller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         telecaller.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || telecaller.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      busy: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      offline: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      break: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    };
    return colors[status as keyof typeof colors] || colors.offline;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  // Calculate aggregate metrics
  const totalTelecallers = telecallers.length;
  const activeTelecallers = telecallers.filter(t => t.status === "active").length;
  const totalCalls = telecallers.reduce((sum, t) => sum + t.performance.totalCalls, 0);
  const totalConversions = telecallers.reduce((sum, t) => sum + t.performance.conversions, 0);
  const avgEfficiency = telecallers.length > 0 
    ? telecallers.reduce((sum, t) => sum + t.performance.efficiency, 0) / telecallers.length 
    : 0;

  if (telecallersLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton for metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <GlassCard key={i} gradient="primary" blur="md">
              <div className="p-6 animate-pulse">
                <div className="h-4 bg-white/20 rounded mb-4"></div>
                <div className="h-8 bg-white/20 rounded mb-2"></div>
                <div className="h-3 bg-white/20 rounded w-2/3"></div>
              </div>
            </GlassCard>
          ))}
        </div>
        
        {/* Skeleton for table */}
        <GlassCard gradient="primary" blur="md">
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-white/20 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary mb-2">
            Telecaller Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage telecaller assignments and track performance
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <GlassButton variant="secondary" size="md">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </GlassButton>
          <GlassButton 
            variant="primary" 
            size="md"
            onClick={() => setIsAddUserModalOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Telecaller
          </GlassButton>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <GlassCard gradient="primary" blur="md" hover={true}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Telecallers</h3>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {totalTelecallers}
            </div>
            <p className="text-sm text-blue-600">{activeTelecallers} active now</p>
          </div>
        </GlassCard>

        <GlassCard gradient="secondary" blur="md" hover={true}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Calls</h3>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {totalCalls.toLocaleString()}
            </div>
            <p className="text-sm text-green-600">This month</p>
          </div>
        </GlassCard>

        <GlassCard gradient="accent" blur="md" hover={true}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversions</h3>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {totalConversions}
            </div>
            <p className="text-sm text-purple-600">{((totalConversions / totalCalls) * 100).toFixed(1)}% conversion rate</p>
          </div>
        </GlassCard>

        <GlassCard gradient="neutral" blur="md" hover={true}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Efficiency</h3>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {avgEfficiency.toFixed(0)}%
            </div>
            <p className="text-sm text-orange-600">Team performance</p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <GlassCard gradient="secondary" blur="sm" className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search telecallers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/20 border-white/30 backdrop-blur-sm"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-white/20 border-white/30 backdrop-blur-sm">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="break">On Break</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Telecallers List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <GlassCard gradient="primary" blur="md">
          <div className="p-6">
            <div className="space-y-4">
              {filteredTelecallers.map((telecaller, index) => (
                <motion.div
                  key={telecaller.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="bg-white/50 dark:bg-white/5 rounded-lg p-6 hover:bg-white/70 dark:hover:bg-white/10 transition-all border border-white/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {telecaller.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {telecaller.name}
                          </h3>
                          <Badge className={`text-xs ${getStatusColor(telecaller.status)}`}>
                            {telecaller.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {telecaller.role}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {telecaller.phone}
                          </span>
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {telecaller.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <GlassButton
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTelecaller(telecaller);
                          setIsAssignModalOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </GlassButton>
                      <GlassButton variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </GlassButton>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-4 pt-4 border-t border-white/20">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-white">{telecaller.performance.totalCalls}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Total Calls</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-white">{telecaller.performance.leadsGenerated}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Leads Generated</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-white">{telecaller.performance.conversions}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Conversions</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-white">{telecaller.performance.efficiency}%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Efficiency</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-white">{telecaller.assignedProjects.length}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Projects</div>
                    </div>
                  </div>

                  {/* Assignments */}
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned Projects</h4>
                        <div className="space-y-1">
                          {telecaller.assignedProjects.map(project => (
                            <div key={project.id} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400">{project.name}</span>
                              <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>
                                {project.priority}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned Banks</h4>
                        <div className="space-y-1">
                          {telecaller.assignedBanks.map(bank => (
                            <div key={bank.id} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400">{bank.name}</span>
                              <Badge className={`text-xs ${getPriorityColor(bank.priority)}`}>
                                {bank.priority}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Add User Modal */}
      <GlassModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        size="md"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Add New Telecaller
          </h2>
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addUserMutation.mutate(newUser);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  required
                  className="bg-white/20 border-white/30 backdrop-blur-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                  className="bg-white/20 border-white/30 backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  required
                  className="bg-white/20 border-white/30 backdrop-blur-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="bg-white/20 border-white/30 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="telecaller">Telecaller</SelectItem>
                    <SelectItem value="senior_telecaller">Senior Telecaller</SelectItem>
                    <SelectItem value="team_lead">Team Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={newUser.workingHours.start}
                  onChange={(e) => setNewUser(prev => ({ 
                    ...prev, 
                    workingHours: { ...prev.workingHours, start: e.target.value }
                  }))}
                  className="bg-white/20 border-white/30 backdrop-blur-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time
                </label>
                <Input
                  type="time"
                  value={newUser.workingHours.end}
                  onChange={(e) => setNewUser(prev => ({ 
                    ...prev, 
                    workingHours: { ...prev.workingHours, end: e.target.value }
                  }))}
                  className="bg-white/20 border-white/30 backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <GlassButton
                type="button"
                variant="ghost"
                onClick={() => setIsAddUserModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                disabled={addUserMutation.isPending}
                className="flex-1"
              >
                {addUserMutation.isPending ? "Adding..." : "Add Telecaller"}
              </GlassButton>
            </div>
          </form>
        </div>
      </GlassModal>

      {/* Assignment Modal */}
      <GlassModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        size="lg"
      >
        {selectedTelecaller && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Manage Assignments - {selectedTelecaller.name}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Assignments */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Project Assignments
                </h3>
                <div className="space-y-3">
                  {availableProjects.map(project => {
                    const isAssigned = selectedTelecaller.assignedProjects.some(p => p.id === project.id);
                    return (
                      <div key={project.id} className="flex items-center justify-between p-3 bg-white/20 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{project.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{project.location} • {project.type}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>
                            {project.priority}
                          </Badge>
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => {
                              // Handle assignment logic
                            }}
                            className="rounded border-white/30 bg-white/20 text-blue-600"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bank Assignments */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Bank Assignments
                </h3>
                <div className="space-y-3">
                  {availableBanks.map(bank => {
                    const isAssigned = selectedTelecaller.assignedBanks.some(b => b.id === bank.id);
                    return (
                      <div key={bank.id} className="flex items-center justify-between p-3 bg-white/20 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{bank.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{bank.type} • {bank.contactPerson}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${getPriorityColor(bank.priority)}`}>
                            {bank.priority}
                          </Badge>
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => {
                              // Handle assignment logic
                            }}
                            className="rounded border-white/30 bg-white/20 text-blue-600"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-6 border-t border-white/20 mt-6">
              <GlassButton
                type="button"
                variant="ghost"
                onClick={() => setIsAssignModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </GlassButton>
              <GlassButton
                type="button"
                variant="primary"
                className="flex-1"
              >
                Save Changes
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
}