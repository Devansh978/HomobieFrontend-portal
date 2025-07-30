import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  DollarSign,
  Percent,
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
// import type { Bank, InsertBank } from "@shared/schema";
// import { insertBankSchema } from "@shared/schema";

export default function BankManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [viewingBank, setViewingBank] = useState<Bank | null>(null);

  // Fetch banks
  const { data: banksResponse, isLoading } = useQuery({
    queryKey: ["/api/banks"],
    refetchInterval: 30000,
  });

  const banks = (banksResponse as any)?.banks || [];

  // Create bank form
  const form = useForm<InsertBank>({
    resolver: zodResolver(insertBankSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "commercial",
      processingFee: 0,
      maxLoanAmount: 0,
      minLoanAmount: 0,
      isActive: true,
      interestRates: {},
    },
  });

  // Create bank mutation
  const createBankMutation = useMutation({
    mutationFn: async (data: InsertBank) => {
      return await apiRequest("/api/banks", { method: "POST", body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banks"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Bank created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create bank",
        variant: "destructive",
      });
    },
  });

  // Update bank mutation
  const updateBankMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<InsertBank> }) => {
      return await apiRequest(`/api/banks/${data.id}`, {
        method: "PUT",
        body: data.updates
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banks"] });
      setEditingBank(null);
      toast({
        title: "Success",
        description: "Bank updated successfully",
      });
    },
  });

  // Delete bank mutation
  const deleteBankMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/banks/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banks"] });
      toast({
        title: "Success",
        description: "Bank deleted successfully",
      });
    },
  });

  // Toggle bank status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (data: { id: number; isActive: boolean }) => {
      return await apiRequest(`/api/banks/${data.id}`, {
        method: "PUT",
        body: { isActive: data.isActive }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banks"] });
      toast({
        title: "Success",
        description: "Bank status updated",
      });
    },
  });

  const onSubmit = (data: InsertBank) => {
    if (editingBank) {
      updateBankMutation.mutate({ id: editingBank.id, updates: data });
    } else {
      createBankMutation.mutate(data);
    }
  };

  const handleEdit = (bank: Bank) => {
    setEditingBank(bank);
    form.reset({
      name: bank.name,
      code: bank.code,
      type: bank.type,
      processingFee: bank.processingFee || 0,
      maxLoanAmount: bank.maxLoanAmount || 0,
      minLoanAmount: bank.minLoanAmount || 0,
      isActive: bank.isActive,
      interestRates: bank.interestRates || {},
    });
    setIsCreateDialogOpen(true);
  };

  const filteredBanks = banks.filter((bank: Bank) => {
    const matchesSearch = bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || bank.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Calculate metrics
  const totalBanks = banks.length;
  const activeBanks = banks.filter((b: Bank) => b.isActive).length;
  const totalLoanCapacity = banks.reduce((sum: number, b: Bank) => sum + (b.maxLoanAmount || 0), 0);
  const avgProcessingFee = banks.length > 0 ? banks.reduce((sum: number, b: Bank) => sum + (b.processingFee || 0), 0) / banks.length : 0;

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
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full blur-3xl"
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
                Bank Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage banking partners, interest rates, and loan products
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) {
                setEditingBank(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bank
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl backdrop-blur-sm bg-white/95 dark:bg-slate-800/95">
                <DialogHeader>
                  <DialogTitle>
                    {editingBank ? "Edit Bank" : "Add New Bank"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingBank ? "Update bank information and loan terms" : "Add a new banking partner with loan products"}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Bank of America" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Code</FormLabel>
                            <FormControl>
                              <Input placeholder="BOA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select bank type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="commercial">Commercial Bank</SelectItem>
                              <SelectItem value="investment">Investment Bank</SelectItem>
                              <SelectItem value="cooperative">Cooperative Bank</SelectItem>
                              <SelectItem value="regional">Regional Bank</SelectItem>
                              <SelectItem value="private">Private Bank</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="processingFee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Processing Fee (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="25000"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="minLoanAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Min Loan (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="500000"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maxLoanAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Loan (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="10000000"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createBankMutation.isPending || updateBankMutation.isPending}
                      >
                        {createBankMutation.isPending || updateBankMutation.isPending
                          ? "Saving..."
                          : editingBank ? "Update Bank" : "Create Bank"
                        }
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
                  <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalBanks}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Banks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{activeBanks}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Active Banks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    ₹{(totalLoanCapacity / 10000000).toFixed(1)}Cr
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <Percent className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    ₹{(avgProcessingFee / 1000).toFixed(0)}K
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Avg Processing Fee</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/30">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search banks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/50 dark:bg-slate-900/50 border-white/20"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-48 bg-white/50 dark:bg-slate-900/50 border-white/20">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="cooperative">Cooperative</SelectItem>
                      <SelectItem value="regional">Regional</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Banks Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredBanks.map((bank: Bank, index: number) => (
            <motion.div
              key={bank.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/30 hover:bg-white/90 dark:hover:bg-slate-800/90">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold line-clamp-1">
                          {bank.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {bank.code} • {bank.type}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={bank.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-0"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-0"
                    }>
                      {bank.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Processing Fee</p>
                        <p className="font-semibold">₹{(bank.processingFee || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Min Loan</p>
                        <p className="font-semibold">₹{((bank.minLoanAmount || 0) / 100000).toFixed(1)}L</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Max Loan</p>
                        <p className="font-semibold">₹{((bank.maxLoanAmount || 0) / 10000000).toFixed(1)}Cr</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Type</p>
                        <p className="font-semibold capitalize">{bank.type}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(bank)}
                          className="bg-white/50 dark:bg-slate-800/50 border-white/20 hover:bg-white/70 dark:hover:bg-slate-700/70"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleStatusMutation.mutate({ id: bank.id, isActive: !bank.isActive })}
                          className={bank.isActive
                            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                            : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40"
                          }
                        >
                          {bank.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteBankMutation.mutate(bank.id)}
                        className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredBanks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center py-12"
          >
            <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
              No banks found
            </h3>
            <p className="text-slate-500 dark:text-slate-500">
              No banks match your current filter criteria.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}