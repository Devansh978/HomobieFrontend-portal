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
import { queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Phone,
  Users,
  TrendingUp,
  Clock,
  Target,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
// import type { Telecaller, TelecallerStatus, User, InsertTelecaller } from "@shared/schema";
// import { insertTelecallerSchema } from "@shared/schema";

export default function TelecallerManagement() {
  const [selectedStatus, setSelectedStatus] = useState<TelecallerStatus | "all">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTelecaller, setEditingTelecaller] = useState<Telecaller | null>(null);

  // Fetch telecallers
  const { data: telecallersResponse, isLoading: telecallersLoading } = useQuery({
    queryKey: ["/api/telecallers"],
    refetchInterval: 30000,
  });

  // Fetch users for assignment
  const { data: usersResponse } = useQuery({
    queryKey: ["/api/users"],
  });

  const telecallers = (telecallersResponse as any)?.telecallers || [];
  const users = (usersResponse as any)?.users || [];

  // Create telecaller form
  const form = useForm<InsertTelecaller>({
    resolver: zodResolver(insertTelecallerSchema),
    defaultValues: {
      userId: 0,
      role: "telecaller",
      status: "offline",
      workingHoursStart: "09:00",
      workingHoursEnd: "18:00",
      timezone: "IST",
      totalCalls: 0,
      successfulCalls: 0,
      leadsGenerated: 0,
      conversions: 0,
      efficiency: 0,
    },
  });

  // Create telecaller mutation
  const createTelecallerMutation = useMutation({
    mutationFn: async (data: InsertTelecaller) => {
      return await apiRequest("/api/telecallers", { method: "POST", body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/telecallers"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Telecaller created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create telecaller",
        variant: "destructive",
      });
    },
  });

  // Update telecaller status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (data: { id: number; status: TelecallerStatus }) => {
      return await apiRequest(`/api/telecallers/${data.id}`, {
        method: "PUT",
        body: { status: data.status }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/telecallers"] });
      toast({
        title: "Success",
        description: "Telecaller status updated",
      });
    },
  });

  // Delete telecaller mutation
  const deleteTelecallerMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/telecallers/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/telecallers"] });
      toast({
        title: "Success",
        description: "Telecaller deleted successfully",
      });
    },
  });

  const getStatusIcon = (status: TelecallerStatus) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "busy": return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "break": return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TelecallerStatus) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "busy": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "break": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const onSubmit = (data: InsertTelecaller) => {
    createTelecallerMutation.mutate(data);
  };

  const filteredTelecallers = telecallers.filter((telecaller: Telecaller) => {
    return selectedStatus === "all" || telecaller.status === selectedStatus;
  });

  // Calculate metrics
  const totalTelecallers = telecallers.length;
  const activeTelecallers = telecallers.filter((t: Telecaller) => t.status === "active").length;
  const totalCalls = telecallers.reduce((sum: number, t: Telecaller) => sum + t.totalCalls, 0);
  const totalLeads = telecallers.reduce((sum: number, t: Telecaller) => sum + t.leadsGenerated, 0);

  if (telecallersLoading) {
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
                Telecaller Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage telecaller assignments, performance, and status
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Telecaller
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md backdrop-blur-sm bg-white/95 dark:bg-slate-800/95">
                <DialogHeader>
                  <DialogTitle>Create New Telecaller</DialogTitle>
                  <DialogDescription>
                    Assign a user as a telecaller with specific working hours
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="userId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User</FormLabel>
                          <Select onValueChange={(value) => field.onChange(Number(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a user" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users.map((user: User) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.firstName} {user.lastName} ({user.username})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="workingHoursStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input {...field} type="time" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="workingHoursEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input {...field} type="time" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createTelecallerMutation.isPending}>
                        {createTelecallerMutation.isPending ? "Creating..." : "Create"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
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
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalTelecallers}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Telecallers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{activeTelecallers}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Active Now</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Phone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalCalls}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Calls</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalLeads}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Leads Generated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/30">
            <CardContent className="p-4">
              <Select value={selectedStatus} onValueChange={(value: TelecallerStatus | "all") => setSelectedStatus(value)}>
                <SelectTrigger className="w-48 bg-white/50 dark:bg-slate-900/50 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="break">On Break</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>

        {/* Telecaller Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTelecallers.map((telecaller: Telecaller & { user: User }, index: number) => {
            const efficiency = telecaller.totalCalls > 0 ? Math.round((telecaller.successfulCalls / telecaller.totalCalls) * 100) : 0;

            return (
              <motion.div
                key={telecaller.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/30 hover:bg-white/90 dark:hover:bg-slate-800/90">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold">
                            {telecaller.user.firstName} {telecaller.user.lastName}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {telecaller.user.email}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(telecaller.status)} border-0`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(telecaller.status)}
                          <span className="capitalize">{telecaller.status}</span>
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Working Hours */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Working Hours:</span>
                        <span className="font-medium">
                          {telecaller.workingHoursStart} - {telecaller.workingHoursEnd}
                        </span>
                      </div>

                      {/* Performance Metrics */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Efficiency</span>
                          <span className="text-sm font-medium">{efficiency}%</span>
                        </div>
                        <Progress value={efficiency} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">Total Calls</p>
                          <p className="font-semibold">{telecaller.totalCalls}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">Successful</p>
                          <p className="font-semibold">{telecaller.successfulCalls}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">Leads</p>
                          <p className="font-semibold">{telecaller.leadsGenerated}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">Conversions</p>
                          <p className="font-semibold">{telecaller.conversions}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex space-x-2">
                          <Select
                            value={telecaller.status}
                            onValueChange={(status: TelecallerStatus) =>
                              updateStatusMutation.mutate({ id: telecaller.id, status })
                            }
                          >
                            <SelectTrigger className="w-32 h-8 bg-white/50 dark:bg-slate-800/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="busy">Busy</SelectItem>
                              <SelectItem value="break">Break</SelectItem>
                              <SelectItem value="offline">Offline</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTelecallerMutation.mutate(telecaller.id)}
                          className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredTelecallers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center py-12"
          >
            <Phone className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
              No telecallers found
            </h3>
            <p className="text-slate-500 dark:text-slate-500">
              No telecallers match your current filter criteria.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}