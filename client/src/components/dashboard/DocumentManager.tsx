import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List,
  Check,
  X,
  Clock,
  AlertTriangle,
  FileImage,
  FileSpreadsheet,
  File
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Document {
  id: number;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: "pending" | "approved" | "rejected" | "urgent";
  leadId: number;
  url: string;
  thumbnailUrl?: string;
}

export function DocumentManager() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [draggedDoc, setDraggedDoc] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents", { search: searchQuery, status: statusFilter }],
    queryFn: async () => {
      // Mock data for demonstration - replace with actual API
      return [
        {
          id: 1,
          name: "Salary Certificate.pdf",
          type: "pdf",
          size: 2048576,
          uploadedAt: "2024-01-15T10:30:00Z",
          status: "approved",
          leadId: 1,
          url: "/documents/salary-cert.pdf",
          thumbnailUrl: "/thumbnails/salary-cert.jpg"
        },
        {
          id: 2,
          name: "Bank Statement.xlsx",
          type: "xlsx",
          size: 1536000,
          uploadedAt: "2024-01-14T14:20:00Z",
          status: "pending",
          leadId: 1,
          url: "/documents/bank-statement.xlsx"
        },
        {
          id: 3,
          name: "Property Papers.jpg",
          type: "jpg",
          size: 3072000,
          uploadedAt: "2024-01-13T09:15:00Z",
          status: "urgent",
          leadId: 2,
          url: "/documents/property-papers.jpg",
          thumbnailUrl: "/thumbnails/property-papers.jpg"
        },
        {
          id: 4,
          name: "ID Proof.pdf",
          type: "pdf",
          size: 1024000,
          uploadedAt: "2024-01-12T16:45:00Z",
          status: "rejected",
          leadId: 2,
          url: "/documents/id-proof.pdf"
        },
        {
          id: 5,
          name: "Income Tax Returns.pdf",
          type: "pdf",
          size: 4096000,
          uploadedAt: "2024-01-11T11:30:00Z",
          status: "approved",
          leadId: 3,
          url: "/documents/itr.pdf"
        }
      ];
    },
    refetchInterval: 30000,
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (docId: number) => {
      const response = await fetch(`/api/document-uploads/${docId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete document");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document deleted",
        description: "The document has been successfully removed.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Unable to delete the document. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Batch delete mutation
  const batchDeleteMutation = useMutation({
    mutationFn: async (docIds: number[]) => {
      return Promise.all(
        docIds.map(id => 
          fetch(`/api/document-uploads/${id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
          }).then(res => {
            if (!res.ok) throw new Error("Failed to delete document");
            return res.json();
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setSelectedDocs([]);
      toast({
        title: "Documents deleted",
        description: `${selectedDocs.length} documents have been removed.`,
      });
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return FileImage;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return FileSpreadsheet;
      default:
        return FileText;
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      approved: {
        color: "bg-green-500",
        icon: Check,
        label: "Approved",
        triangle: "clip-path: polygon(100% 0, 0 0, 100% 100%); background: linear-gradient(135deg, #10b981, #059669);"
      },
      pending: {
        color: "bg-yellow-500",
        icon: Clock,
        label: "Pending",
        triangle: "clip-path: polygon(100% 0, 0 0, 100% 100%); background: linear-gradient(135deg, #f59e0b, #d97706);"
      },
      rejected: {
        color: "bg-red-500",
        icon: X,
        label: "Rejected",
        triangle: "clip-path: polygon(100% 0, 0 0, 100% 100%); background: linear-gradient(135deg, #ef4444, #dc2626);"
      },
      urgent: {
        color: "bg-orange-500",
        icon: AlertTriangle,
        label: "Urgent",
        triangle: "clip-path: polygon(100% 0, 0 0, 100% 100%); background: linear-gradient(135deg, #f97316, #ea580c);"
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleDocSelection = (docId: number) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const selectAllDocs = () => {
    if (selectedDocs.length === filteredDocuments.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(filteredDocuments.map(doc => doc.id));
    }
  };

  if (isLoading) {
    return (
      <GlassCard gradient="primary" blur="md">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-white/20 rounded-lg mb-3"></div>
                <div className="h-4 bg-white/20 rounded mb-2"></div>
                <div className="h-3 bg-white/20 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Document Manager
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and organize all loan documents
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <GlassButton variant="primary" size="md">
            <Upload className="mr-2 h-4 w-4" />
            Upload Documents
          </GlassButton>
        </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard gradient="secondary" blur="sm" className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search documents..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              {selectedDocs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2"
                >
                  <Badge variant="secondary">
                    {selectedDocs.length} selected
                  </Badge>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => batchDeleteMutation.mutate(selectedDocs)}
                    disabled={batchDeleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </GlassButton>
                </motion.div>
              )}

              <div className="flex items-center bg-white/20 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-white/30" : ""}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-white/30" : ""}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Documents Grid/List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard gradient="primary" blur="md">
          <div className="p-6">
            {/* Select All Checkbox */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0}
                  onChange={selectAllDocs}
                  className="rounded border-white/30 bg-white/20 text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Select all ({filteredDocuments.length})
                </span>
              </label>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total: {filteredDocuments.length} documents
              </p>
            </div>

            {/* Documents */}
            <AnimatePresence mode="wait">
              {viewMode === "grid" ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {filteredDocuments.map((doc, index) => {
                    const statusConfig = getStatusConfig(doc.status);
                    const FileIcon = getFileIcon(doc.type);
                    const isSelected = selectedDocs.includes(doc.id);

                    return (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`relative group cursor-pointer transition-all duration-300 ${
                          isSelected ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => toggleDocSelection(doc.id)}
                        onDragStart={() => setDraggedDoc(doc.id)}
                        onDragEnd={() => setDraggedDoc(null)}
                        draggable
                      >
                        <GlassCard
                          gradient="neutral"
                          blur="sm"
                          hover={true}
                          className="h-full overflow-hidden"
                        >
                          {/* Status Flag Triangle */}
                          <div 
                            className="absolute top-0 right-0 w-12 h-12 z-10"
                            style={{
                              clipPath: "polygon(100% 0, 0 0, 100% 100%)",
                              background: statusConfig.triangle.includes("green") 
                                ? "linear-gradient(135deg, #10b981, #059669)"
                                : statusConfig.triangle.includes("yellow")
                                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                                : statusConfig.triangle.includes("red")
                                ? "linear-gradient(135deg, #ef4444, #dc2626)"
                                : "linear-gradient(135deg, #f97316, #ea580c)"
                            }}
                          >
                            <statusConfig.icon className="absolute top-1 right-1 h-3 w-3 text-white" />
                          </div>

                          {/* Document Thumbnail/Icon */}
                          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
                            {doc.thumbnailUrl ? (
                              <img
                                src={doc.thumbnailUrl}
                                alt={doc.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FileIcon className="h-16 w-16 text-gray-400" />
                            )}
                            
                            {/* Hover Controls */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                              <GlassButton
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(doc.url, '_blank');
                                }}
                              >
                                <Eye className="h-4 w-4 text-white" />
                              </GlassButton>
                              <GlassButton
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Download logic
                                }}
                              >
                                <Download className="h-4 w-4 text-white" />
                              </GlassButton>
                              <GlassButton
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMutation.mutate(doc.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-white" />
                              </GlassButton>
                            </div>
                          </div>

                          {/* Document Info */}
                          <div className="p-4">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate mb-2">
                              {doc.name}
                            </h3>
                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                              <span>{formatFileSize(doc.size)}</span>
                              <Badge variant="outline" className={`text-xs ${statusConfig.color} text-white border-0`}>
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Selection Checkbox */}
                          <div className="absolute top-3 left-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleDocSelection(doc.id)}
                              className="rounded border-white/30 bg-white/20 text-blue-600"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </GlassCard>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {filteredDocuments.map((doc, index) => {
                    const statusConfig = getStatusConfig(doc.status);
                    const FileIcon = getFileIcon(doc.type);
                    const isSelected = selectedDocs.includes(doc.id);

                    return (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`transition-all duration-300 ${
                          isSelected ? 'ring-2 ring-blue-500 rounded-lg' : ''
                        }`}
                      >
                        <GlassCard
                          gradient="neutral"
                          blur="sm"
                          hover={true}
                          className="p-4 cursor-pointer"
                          onClick={() => toggleDocSelection(doc.id)}
                        >
                          <div className="flex items-center space-x-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleDocSelection(doc.id)}
                              className="rounded border-white/30 bg-white/20 text-blue-600"
                              onClick={(e) => e.stopPropagation()}
                            />
                            
                            <div className="flex-shrink-0">
                              <FileIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                  {doc.name}
                                </h3>
                                <Badge variant="outline" className={`text-xs ${statusConfig.color} text-white border-0`}>
                                  {statusConfig.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <GlassButton
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(doc.url, '_blank');
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </GlassButton>
                              <GlassButton
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Download logic
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </GlassButton>
                              <GlassButton
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMutation.mutate(doc.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </GlassButton>
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {filteredDocuments.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No documents found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery || statusFilter !== "all" 
                    ? "Try adjusting your search or filter criteria" 
                    : "Upload your first document to get started"
                  }
                </p>
              </motion.div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}