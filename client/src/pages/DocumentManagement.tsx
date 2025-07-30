import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Upload,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
// import type { DocumentUpload, DocumentStatus } from "@shared/schema";

export default function DocumentManagement() {
  const [filter, setFilter] = useState<DocumentStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<DocumentUpload | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewStatus, setReviewStatus] = useState<DocumentStatus>("approved");

  // Fetch document uploads
  const { data: documentsResponse, isLoading } = useQuery({
    queryKey: ["/api/document-uploads", filter, searchTerm],
    refetchInterval: 30000,
  });

  const documents = (documentsResponse as any)?.documents || [];

  // Review document mutation
  const reviewDocumentMutation = useMutation({
    mutationFn: async (data: { id: number; status: DocumentStatus; notes: string }) => {
      return await apiRequest(`/api/document-uploads/${data.id}`, {
        method: "PUT",
        body: { status: data.status, notes: data.notes }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-uploads"] });
      setIsReviewDialogOpen(false);
      setSelectedDocument(null);
      toast({
        title: "Success",
        description: "Document review completed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to review document",
        variant: "destructive",
      });
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/document-uploads/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-uploads"] });
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected": return <XCircle className="h-4 w-4 text-red-500" />;
      case "urgent": return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "urgent": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    }
  };

  const handleReviewDocument = (document: DocumentUpload) => {
    setSelectedDocument(document);
    setReviewNotes(document.notes || "");
    setReviewStatus(document.status);
    setIsReviewDialogOpen(true);
  };

  const submitReview = () => {
    if (!selectedDocument) return;

    reviewDocumentMutation.mutate({
      id: selectedDocument.id,
      status: reviewStatus,
      notes: reviewNotes
    });
  };

  const filteredDocuments = documents.filter((doc: DocumentUpload) => {
    const matchesFilter = filter === "all" || doc.status === filter;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Document Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Review, approve, and manage document uploads across all leads
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-white/20 dark:border-slate-700/30">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/50 dark:bg-slate-900/50 border-white/20"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filter} onValueChange={(value: DocumentStatus | "all") => setFilter(value)}>
                    <SelectTrigger className="w-48 bg-white/50 dark:bg-slate-900/50 border-white/20">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Documents Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredDocuments.map((document: DocumentUpload, index: number) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/30 hover:bg-white/90 dark:hover:bg-slate-800/90">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold line-clamp-1">
                          {document.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {document.type} • {(document.size / 1024 / 1024).toFixed(2)} MB
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(document.status)} border-0`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(document.status)}
                        <span className="capitalize">{document.status}</span>
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {document.leadId && (
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Lead ID: #{document.leadId}
                      </div>
                    )}

                    {document.notes && (
                      <div className="text-sm p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                          {document.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-slate-500">
                        {new Date(document.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReviewDocument(document)}
                          className="bg-white/50 dark:bg-slate-800/50 border-white/20 hover:bg-white/70 dark:hover:bg-slate-700/70"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteDocumentMutation.mutate(document.id)}
                          className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredDocuments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-12"
          >
            <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
              No documents found
            </h3>
            <p className="text-slate-500 dark:text-slate-500">
              No documents match your current filter criteria.
            </p>
          </motion.div>
        )}
      </div>

      {/* Review Document Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-lg backdrop-blur-sm bg-white/95 dark:bg-slate-800/95">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Review Document</span>
            </DialogTitle>
            <DialogDescription>
              Review and update the status of this document
            </DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <h4 className="font-medium">{selectedDocument.name}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedDocument.type} • {(selectedDocument.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Review Status</label>
                <Select value={reviewStatus} onValueChange={(value: DocumentStatus) => setReviewStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Review Notes</label>
                <Textarea
                  placeholder="Add your review comments..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsReviewDialogOpen(false)}
                  className="bg-white/50 dark:bg-slate-800/50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitReview}
                  disabled={reviewDocumentMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {reviewDocumentMutation.isPending ? "Updating..." : "Submit Review"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}