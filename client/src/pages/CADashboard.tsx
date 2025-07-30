import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FileCheck, Clock, AlertCircle, CheckCircle, XCircle, Eye, Download } from "lucide-react";
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

interface Document {
  id: number;
  name: string;
  type: string;
  status: string;
  url: string;
  uploadedAt: string;
}

export default function CADashboard() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  
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

  const { data: documents = [] } = useQuery({
    queryKey: ["/api/document-uploads"],
    queryFn: () => apiRequest("/api/document-uploads"),
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest(`/api/leads/${id}`, { method: "PUT", body: { status } }),
    onSuccess: () => {
      toast({ title: "Success", description: "Lead status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setIsReviewOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update lead status", variant: "destructive" });
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest(`/api/document-uploads/${id}`, { method: "PUT", body: { status } }),
    onSuccess: () => {
      toast({ title: "Success", description: "Document status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/document-uploads"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update document status", variant: "destructive" });
    },
  });

  const handleReviewSubmit = () => {
    if (!selectedLead || !reviewStatus) {
      toast({ title: "Error", description: "Please select a status", variant: "destructive" });
      return;
    }
    updateLeadMutation.mutate({ id: selectedLead.id, status: reviewStatus });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
      under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200",
      documents_requested: "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200",
      approved: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200",
      pending: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
      urgent: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200"
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

  const pendingReviewLeads = leads.leads?.filter((lead: Lead) => 
    ['documents_received', 'under_review'].includes(lead.status)
  ) || [];

  const pendingDocuments = documents.documents?.filter((doc: Document) => 
    doc.status === 'pending'
  ) || [];

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
            CA Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Document review and loan processing</p>
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
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReviewLeads.length}</div>
              <p className="text-xs text-muted-foreground">Applications awaiting review</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingDocuments.length}</div>
              <p className="text-xs text-muted-foreground">Pending verification</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.conversions || 0}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.5</div>
              <p className="text-xs text-muted-foreground">Days average</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="review" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="review">Application Review</TabsTrigger>
              <TabsTrigger value="documents">Document Verification</TabsTrigger>
              <TabsTrigger value="analytics">Processing Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="review" className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Loan Applications for Review</CardTitle>
                  <CardDescription>Applications requiring CA review and approval</CardDescription>
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
                      {pendingReviewLeads.map((lead: Lead) => (
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedLead(lead);
                                setIsReviewOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Review
                            </Button>
                          </div>
                        </div>
                      ))}
                      {pendingReviewLeads.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No applications pending review</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Document Verification</CardTitle>
                  <CardDescription>Review and verify uploaded documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingDocuments.map((doc: Document) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white">
                            <FileCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">{doc.type}</p>
                            <p className="text-sm text-muted-foreground">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(doc.status)}>
                            {doc.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateDocumentMutation.mutate({ id: doc.id, status: 'approved' })}
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateDocumentMutation.mutate({ id: doc.id, status: 'rejected' })}
                          >
                            <XCircle className="mr-2 h-4 w-4 text-red-600" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingDocuments.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No documents pending verification</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Processing Analytics</CardTitle>
                  <CardDescription>Track processing efficiency and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div className="text-3xl font-bold text-blue-600">{pendingReviewLeads.length}</div>
                      <div className="text-sm text-muted-foreground">Pending Reviews</div>
                    </div>
                    <div className="text-center p-6 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="text-3xl font-bold text-green-600">{metrics?.conversions || 0}</div>
                      <div className="text-sm text-muted-foreground">Processed This Month</div>
                    </div>
                    <div className="text-center p-6 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <div className="text-3xl font-bold text-purple-600">2.5</div>
                      <div className="text-sm text-muted-foreground">Avg. Processing Days</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Review Dialog */}
        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
          <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle>Review Application</DialogTitle>
              <DialogDescription>
                Review and update the status of {selectedLead?.firstName} {selectedLead?.lastName}'s application
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Applicant Details</Label>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p><strong>Name:</strong> {selectedLead?.firstName} {selectedLead?.lastName}</p>
                  <p><strong>Email:</strong> {selectedLead?.email}</p>
                  <p><strong>Loan Amount:</strong> {selectedLead ? formatCurrency(selectedLead.loanAmount) : ''}</p>
                  <p><strong>Loan Type:</strong> {selectedLead?.loanType}</p>
                  <p><strong>Current Status:</strong> {selectedLead?.status}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">New Status</Label>
                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="documents_requested">Request More Documents</SelectItem>
                    <SelectItem value="under_review">Keep Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Comments (Optional)</Label>
                <Textarea
                  id="comment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Add any comments or feedback..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleReviewSubmit}
                disabled={updateLeadMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {updateLeadMutation.isPending ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}