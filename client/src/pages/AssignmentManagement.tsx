import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Users,
  Building2,
  UserPlus,
  UserMinus,
  Target,
  Building,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Plus,
  Trash2
} from "lucide-react";
import { motion } from "framer-motion";
// import type { 
//   ProjectAssignment, 
//   BankAssignment, 
//   Telecaller, 
//   Project, 
//   Bank, 
//   User,
//   InsertProjectAssignment,
//   InsertBankAssignment 
// } from "@shared/schema";
// import { insertProjectAssignmentSchema, insertBankAssignmentSchema } from "@shared/schema";

export default function AssignmentManagement() {
  const [activeTab, setActiveTab] = useState("projects");
  const [searchTerm, setSearchTerm] = useState("");
  const [isProjectAssignDialogOpen, setIsProjectAssignDialogOpen] = useState(false);
  const [isBankAssignDialogOpen, setIsBankAssignDialogOpen] = useState(false);

  // Fetch project assignments
  const { data: projectAssignmentsResponse, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/project-assignments"],
    refetchInterval: 30000,
  });

  // Fetch bank assignments
  const { data: bankAssignmentsResponse, isLoading: banksLoading } = useQuery({
    queryKey: ["/api/bank-assignments"],
    refetchInterval: 30000,
  });

  // Fetch telecallers
  const { data: telecallersResponse } = useQuery({
    queryKey: ["/api/telecallers"],
  });

  // Fetch projects
  const { data: projectsResponse } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Fetch banks
  const { data: banksResponse } = useQuery({
    queryKey: ["/api/banks"],
  });

  const projectAssignments = (projectAssignmentsResponse as any)?.assignments || [];
  const bankAssignments = (bankAssignmentsResponse as any)?.assignments || [];
  const telecallers = (telecallersResponse as any)?.telecallers || [];
  const projects = (projectsResponse as any)?.projects || [];
  const banks = (banksResponse as any)?.banks || [];

  // Project assignment form
  const projectForm = useForm<InsertProjectAssignment>({
    resolver: zodResolver(insertProjectAssignmentSchema),
    defaultValues: {
      telecallerId: 0,
      projectId: 0,
      assignedById: 0,
      isActive: true,
    },
  });

  // Bank assignment form
  const bankForm = useForm<InsertBankAssignment>({
    resolver: zodResolver(insertBankAssignmentSchema),
    defaultValues: {
      telecallerId: 0,
      bankId: 0,
      assignedById: 0,
      isActive: true,
    },
  });

  // Create project assignment mutation
  const createProjectAssignmentMutation = useMutation({
    mutationFn: async (data: InsertProjectAssignment) => {
      return await apiRequest("/api/project-assignments", { method: "POST", body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-assignments"] });
      setIsProjectAssignDialogOpen(false);
      projectForm.reset();
      toast({
        title: "Success",
        description: "Project assignment created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project assignment",
        variant: "destructive",
      });
    },
  });

  // Create bank assignment mutation
  const createBankAssignmentMutation = useMutation({
    mutationFn: async (data: InsertBankAssignment) => {
      return await apiRequest("/api/bank-assignments", { method: "POST", body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-assignments"] });
      setIsBankAssignDialogOpen(false);
      bankForm.reset();
      toast({
        title: "Success",
        description: "Bank assignment created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create bank assignment",
        variant: "destructive",
      });
    },
  });

  // Remove project assignment mutation
  const removeProjectAssignmentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/project-assignments/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-assignments"] });
      toast({
        title: "Success",
        description: "Project assignment removed",
      });
    },
  });

  // Remove bank assignment mutation
  const removeBankAssignmentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/bank-assignments/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-assignments"] });
      toast({
        title: "Success",
        description: "Bank assignment removed",
      });
    },
  });

  const onProjectSubmit = (data: InsertProjectAssignment) => {
    createProjectAssignmentMutation.mutate(data);
  };

  const onBankSubmit = (data: InsertBankAssignment) => {
    createBankAssignmentMutation.mutate(data);
  };

  // Calculate metrics
  const totalProjectAssignments = projectAssignments.length;
  const totalBankAssignments = bankAssignments.length;
  const activeProjectAssignments = projectAssignments.filter((a: ProjectAssignment) => a.isActive).length;
  const activeBankAssignments = bankAssignments.filter((a: BankAssignment) => a.isActive).length;

  const isLoading = projectsLoading || banksLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                Assignment Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage telecaller assignments for projects and banking partners
              </p>
            </div>
          </div>
        </motion.div>

        {/* Metrics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalProjectAssignments}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Project Assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalBankAssignments}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Bank Assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{activeProjectAssignments}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Active Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <CheckCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{activeBankAssignments}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Active Banks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs for Project and Bank Assignments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-6">
              <TabsList className="grid w-fit grid-cols-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20">
                <TabsTrigger value="projects" className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Project Assignments</span>
                </TabsTrigger>
                <TabsTrigger value="banks" className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Bank Assignments</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex space-x-2">
                {activeTab === "projects" && (
                  <Dialog open={isProjectAssignDialogOpen} onOpenChange={setIsProjectAssignDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Assign Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md backdrop-blur-sm bg-white/95 dark:bg-slate-800/95">
                      <DialogHeader>
                        <DialogTitle>Assign Project to Telecaller</DialogTitle>
                        <DialogDescription>
                          Select a telecaller and project to create an assignment
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...projectForm}>
                        <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-4">
                          <FormField
                            control={projectForm.control}
                            name="telecallerId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telecaller</FormLabel>
                                <Select onValueChange={(value) => field.onChange(Number(value))}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select telecaller" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {telecallers.map((telecaller: Telecaller & { user: User }) => (
                                      <SelectItem key={telecaller.id} value={telecaller.id.toString()}>
                                        {telecaller.user.firstName} {telecaller.user.lastName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={projectForm.control}
                            name="projectId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Project</FormLabel>
                                <Select onValueChange={(value) => field.onChange(Number(value))}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select project" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {projects.map((project: Project) => (
                                      <SelectItem key={project.id} value={project.id.toString()}>
                                        {project.name} - {project.location}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsProjectAssignDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createProjectAssignmentMutation.isPending}>
                              {createProjectAssignmentMutation.isPending ? "Assigning..." : "Assign"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}

                {activeTab === "banks" && (
                  <Dialog open={isBankAssignDialogOpen} onOpenChange={setIsBankAssignDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Assign Bank
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md backdrop-blur-sm bg-white/95 dark:bg-slate-800/95">
                      <DialogHeader>
                        <DialogTitle>Assign Bank to Telecaller</DialogTitle>
                        <DialogDescription>
                          Select a telecaller and bank to create an assignment
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...bankForm}>
                        <form onSubmit={bankForm.handleSubmit(onBankSubmit)} className="space-y-4">
                          <FormField
                            control={bankForm.control}
                            name="telecallerId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telecaller</FormLabel>
                                <Select onValueChange={(value) => field.onChange(Number(value))}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select telecaller" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {telecallers.map((telecaller: Telecaller & { user: User }) => (
                                      <SelectItem key={telecaller.id} value={telecaller.id.toString()}>
                                        {telecaller.user.firstName} {telecaller.user.lastName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={bankForm.control}
                            name="bankId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bank</FormLabel>
                                <Select onValueChange={(value) => field.onChange(Number(value))}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select bank" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {banks.map((bank: Bank) => (
                                      <SelectItem key={bank.id} value={bank.id.toString()}>
                                        {bank.name} ({bank.code})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsBankAssignDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createBankAssignmentMutation.isPending}>
                              {createBankAssignmentMutation.isPending ? "Assigning..." : "Assign"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            {/* Project Assignments Tab */}
            <TabsContent value="projects" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectAssignments.map((assignment: ProjectAssignment & { telecaller: Telecaller & { user: User }, project: Project }, index: number) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="group hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/30 hover:bg-white/90 dark:hover:bg-slate-800/90">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <CardTitle className="text-lg font-semibold line-clamp-1">
                                {assignment.project.name}
                              </CardTitle>
                              <CardDescription className="text-sm">
                                {assignment.project.location}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={assignment.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-0"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-0"
                          }>
                            {assignment.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Phone className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                              <span className="font-medium">Assigned Telecaller</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {assignment.telecaller.user.firstName} {assignment.telecaller.user.lastName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                              {assignment.telecaller.user.email}
                            </p>
                          </div>

                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Assigned:</span>
                            <span className="font-medium">
                              {new Date(assignment.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-700">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeProjectAssignmentMutation.mutate(assignment.id)}
                              className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {projectAssignments.length === 0 && (
                <div className="text-center py-12">
                  <Building className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    No project assignments
                  </h3>
                  <p className="text-slate-500 dark:text-slate-500">
                    Create your first project assignment to get started.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Bank Assignments Tab */}
            <TabsContent value="banks" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bankAssignments.map((assignment: BankAssignment & { telecaller: Telecaller & { user: User }, bank: Bank }, index: number) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="group hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/30 hover:bg-white/90 dark:hover:bg-slate-800/90">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                              <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <CardTitle className="text-lg font-semibold line-clamp-1">
                                {assignment.bank.name}
                              </CardTitle>
                              <CardDescription className="text-sm">
                                {assignment.bank.code} • {assignment.bank.type}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={assignment.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-0"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-0"
                          }>
                            {assignment.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Phone className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                              <span className="font-medium">Assigned Telecaller</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {assignment.telecaller.user.firstName} {assignment.telecaller.user.lastName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                              {assignment.telecaller.user.email}
                            </p>
                          </div>

                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Assigned:</span>
                            <span className="font-medium">
                              {new Date(assignment.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-700">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeBankAssignmentMutation.mutate(assignment.id)}
                              className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {bankAssignments.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    No bank assignments
                  </h3>
                  <p className="text-slate-500 dark:text-slate-500">
                    Create your first bank assignment to get started.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}