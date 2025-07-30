import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, Users, Phone, FileText, Plus, Calculator, Clock, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  loanType: string;
  loanAmount: number;
  status: string;
  createdAt: string;
}

export default function BrokerDashboard() {
  const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    loanType: "home_loan",
    loanAmount: 0,
    notes: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["/api/leads"],
    queryFn: () => apiRequest("/api/leads"),
  });

  const { data: metrics } = useQuery({
    queryKey: ["/api/leads/metrics"],
    queryFn: () => apiRequest("/api/leads/metrics"),
  });

  const createLeadMutation = useMutation({
    mutationFn: (leadData: any) => apiRequest("/api/leads", { method: "POST", body: leadData }),
    onSuccess: () => {
      toast({ title: "Success", description: "Lead created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setIsCreateLeadOpen(false);
      setNewLead({ firstName: "", lastName: "", email: "", phone: "", loanType: "home_loan", loanAmount: 0, notes: "" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create lead", variant: "destructive" });
    },
  });

  const handleCreateLead = () => {
    if (!newLead.firstName || !newLead.lastName || !newLead.email) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    createLeadMutation.mutate(newLead);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
      contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200",
      documents_requested: "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200",
      under_review: "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200",
      approved: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200"
    };
    return colors[status as keyof typeof colors] || colors.new;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Broker Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Manage loan applications and client relationships</p>
        </motion.div>

        {/* Metrics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leads.leads?.length || 0}</div>
              <p className="text-xs text-muted-foreground">All applications</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.newLeads || 0}</div>
              <p className="text-xs text-muted-foreground">Pending follow-up</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.conversions || 0}</div>
              <p className="text-xs text-muted-foreground">Approved this month</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(125000)}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="leads" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="leads">Lead Management</TabsTrigger>
              <TabsTrigger value="calculator">Loan Calculator</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="leads" className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Lead Management</CardTitle>
                      <CardDescription>Track and manage loan applications</CardDescription>
                    </div>
                    <Dialog open={isCreateLeadOpen} onOpenChange={setIsCreateLeadOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                          <Plus className="mr-2 h-4 w-4" />
                          New Lead
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
                        <DialogHeader>
                          <DialogTitle>Create New Lead</DialogTitle>
                          <DialogDescription>Add a new loan application</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="firstName" className="text-right">First Name</Label>
                            <Input
                              id="firstName"
                              value={newLead.firstName}
                              onChange={(e) => setNewLead({ ...newLead, firstName: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastName" className="text-right">Last Name</Label>
                            <Input
                              id="lastName"
                              value={newLead.lastName}
                              onChange={(e) => setNewLead({ ...newLead, lastName: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newLead.email}
                              onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">Phone</Label>
                            <Input
                              id="phone"
                              value={newLead.phone}
                              onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="loanType" className="text-right">Loan Type</Label>
                            <Select value={newLead.loanType} onValueChange={(value) => setNewLead({ ...newLead, loanType: value })}>
                              <SelectTrigger className="col-span-3">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="home_loan">Home Loan</SelectItem>
                                <SelectItem value="loan_against_property">Loan Against Property</SelectItem>
                                <SelectItem value="business_loan">Business Loan</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="loanAmount" className="text-right">Loan Amount</Label>
                            <Input
                              id="loanAmount"
                              type="number"
                              value={newLead.loanAmount}
                              onChange={(e) => setNewLead({ ...newLead, loanAmount: parseInt(e.target.value) })}
                              className="col-span-3"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleCreateLead}
                            disabled={createLeadMutation.isPending}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          >
                            {createLeadMutation.isPending ? "Creating..." : "Create Lead"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse flex space-x-4">
                          <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                          <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {leads.leads?.map((lead: Lead) => (
                        <div key={lead.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                              {lead.firstName[0]}{lead.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                              <p className="text-sm text-muted-foreground">{lead.email}</p>
                              <p className="text-sm text-muted-foreground">{formatCurrency(lead.loanAmount)} - {lead.loanType}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(lead.status)}>
                              {lead.status.replace('_', ' ')}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Phone className="mr-2 h-4 w-4" />
                              Call
                            </Button>
                          </div>
                        </div>
                      )) || <p className="text-center text-muted-foreground">No leads found</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calculator" className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="mr-2 h-5 w-5" />
                    Loan Calculator
                  </CardTitle>
                  <CardDescription>Calculate EMI and loan eligibility for clients</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Loan Amount</Label>
                        <Input type="number" placeholder="Enter amount" />
                      </div>
                      <div>
                        <Label>Interest Rate (%)</Label>
                        <Input type="number" placeholder="Enter rate" />
                      </div>
                      <div>
                        <Label>Tenure (Years)</Label>
                        <Input type="number" placeholder="Enter tenure" />
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                        Calculate EMI
                      </Button>
                    </div>
                    <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h3 className="font-semibold">Calculation Results</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Monthly EMI:</span>
                          <span className="font-medium">₹45,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Interest:</span>
                          <span className="font-medium">₹8,50,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Amount:</span>
                          <span className="font-medium">₹58,50,000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Performance Analytics
                  </CardTitle>
                  <CardDescription>Track your performance and earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div className="text-3xl font-bold text-blue-600">{leads.leads?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Applications</div>
                    </div>
                    <div className="text-center p-6 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="text-3xl font-bold text-green-600">{metrics?.conversions || 0}</div>
                      <div className="text-sm text-muted-foreground">Successful Closures</div>
                    </div>
                    <div className="text-center p-6 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <div className="text-3xl font-bold text-purple-600">75%</div>
                      <div className="text-sm text-muted-foreground">Conversion Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}