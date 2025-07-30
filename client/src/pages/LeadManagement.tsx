import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  User,
  ShieldCheck,
} from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EnhancedRoleBasedNavbar } from "@/components/layout/EnhancedRoleBasedNavbar";
import { EnhancedCreateProjectDialog } from "@/components/dashboard/EnhancedCreateProjectDialog";
// TODO: Replace with the correct dialog component if available, or implement EnhancedCreateProjectDialog.
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// ### Data Structures aligned with Backend DTOs ###

interface LocationResponse {
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
}

interface LeadDetailsResponse {
  leadId: string; // UUID
  firstName: string;
  lastName: string;
  phoneNumber: string;
  location: LocationResponse;
  loanStatus: string;
}

const updateLeadSchema = z.object({
  loanStatus: z.string().min(1, "Status is required"),
});

type UpdateLeadFormData = z.infer<typeof updateLeadSchema>;

// ### Main Component ###

export default function LeadManagement() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ### State Management ###
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadDetailsResponse | null>(
    null
  );
  const [viewingLead, setViewingLead] = useState<LeadDetailsResponse | null>(
    null
  );

  // ### Role-Based Access Control (Simplified for display) ###
  const isAdmin = user?.role === "super_admin" || user?.role === "admin";
  const isBuilder = user?.role === "builder";
  const isUser = user?.role === "user";

  // ### Data Fetching (useQuery) ###
  const { data: leads = [], isLoading } = useQuery<LeadDetailsResponse[]>({
    queryKey: ["leads", user?.userId],
    queryFn: async () => {
      if (!user?.userId) return [];
      const token = localStorage.getItem("auth_token") || "";

      // NOTE: The backend endpoint /leads/get/{userId} doesn't support search.
      // Search functionality is implemented on the client-side for now.
      try {
        const response = await apiRequest(`/leads/get/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return Array.isArray(response) ? response : [];
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not fetch leads.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!user?.userId, // Only run query if user ID is available
  });

  // Client-side filtering
  const filteredLeads = leads.filter(
    (lead) =>
      `${lead.firstName} ${lead.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      lead.phoneNumber.includes(searchTerm)
  );

  // ### Mutations (Update and Delete) - COMMENTED OUT ###
  // NOTE: These mutations require corresponding PUT and DELETE endpoints in your LeadController.
  /*
  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, data }: { leadId: string; data: UpdateLeadFormData }) => {
      const token = localStorage.getItem("auth_token") || "";
      // Assumes an endpoint like: PUT /leads/{leadId}/status
      return await apiRequest(`/leads/${leadId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: data,
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Lead status updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setEditingLead(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update lead.", variant: "destructive" });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const token = localStorage.getItem("auth_token") || "";
      // Assumes an endpoint like: DELETE /leads/{leadId}
      return await apiRequest(`/leads/${leadId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Lead deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete lead.", variant: "destructive" });
    },
  });
  */

  // ### Form Handling ###
  const editForm = useForm<UpdateLeadFormData>({
    resolver: zodResolver(updateLeadSchema),
  });

  const handleEditOpen = (lead: LeadDetailsResponse) => {
    setEditingLead(lead);
    editForm.reset({ loanStatus: lead.loanStatus });
  };

  const onUpdateSubmit = (data: UpdateLeadFormData) => {
    if (editingLead) {
      // updateLeadMutation.mutate({ leadId: editingLead.leadId, data });
      console.log("Update functionality commented out. Payload:", {
        leadId: editingLead.leadId,
        data,
      });
      toast({
        title: "Info",
        description: "Update endpoint not implemented in backend.",
      });
    }
  };

  // ### Helper Functions ###
  const formatAddress = (location: LocationResponse) => {
    const parts = [
      location.addressLine1,
      location.addressLine2,
      location.city,
      location.state,
    ];
    return `${parts.filter(Boolean).join(", ")} - ${location.pincode}`;
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status?.toLowerCase() || "default";
    const statuses: { [key: string]: string } = {
      new: "bg-blue-500/20 text-blue-100 border-blue-500/30",
      contacted: "bg-yellow-500/20 text-yellow-100 border-yellow-500/30",
      approved: "bg-emerald-500/20 text-emerald-100 border-emerald-500/30",
      rejected: "bg-red-500/20 text-red-100 border-red-500/30",
      default: "bg-gray-500/20 text-gray-100 border-gray-500/30",
    };
    return statuses[lowerStatus] || statuses.default;
  };

  // ### Render Logic ###
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <EnhancedRoleBasedNavbar user={user} onLogout={logout} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 p-4 md:p-6 space-y-6 pt-24"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
            Lead Management
          </h1>
          <p className="text-lg text-gray-300 mt-2">
            View and manage your leads.
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div variants={itemVariants}>
          <GlassCard blur="md" className="p-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative flex-1 w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white"
                />
              </div>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="w-full md:w-auto bg-emerald-500/80 hover:bg-emerald-500/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Leads Table */}
        <motion.div variants={itemVariants}>
          <GlassCard blur="md" className="p-0 md:p-2">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-white/20 hover:bg-transparent">
                    <TableHead className="text-white">Name</TableHead>
                    <TableHead className="text-white">Phone</TableHead>
                    <TableHead className="text-white">Address</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-gray-400 py-8"
                      >
                        Loading leads...
                      </TableCell>
                    </TableRow>
                  ) : filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-gray-400 py-8"
                      >
                        No leads found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow
                        key={lead.leadId}
                        className="border-b-white/10 hover:bg-white/5"
                      >
                        <TableCell className="font-medium text-white">
                          {lead.firstName} {lead.lastName}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {lead.phoneNumber}
                        </TableCell>
                        <TableCell className="text-gray-300 text-sm">
                          {formatAddress(lead.location)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(lead.loanStatus)}>
                            {lead.loanStatus || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setViewingLead(lead)}
                            >
                              <Eye size={14} />
                            </Button>
                            {/* NOTE: Edit/Delete buttons disabled until backend endpoints are ready */}
                            {/* {isAdmin && (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditOpen(lead)}
                                >
                                  <Edit size={14} />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => deleteLeadMutation.mutate(lead.leadId)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </>
                            )} */}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Dialogs */}
      <EnhancedCreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {/* View Lead Dialog */}
      <Dialog open={!!viewingLead} onOpenChange={() => setViewingLead(null)}>
        <DialogContent className="bg-slate-800/95 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              Full information for {viewingLead?.firstName}{" "}
              {viewingLead?.lastName}.
            </DialogDescription>
          </DialogHeader>
          {viewingLead && (
            <div className="space-y-4 py-4">
              <p>
                <User className="inline mr-2" />
                <strong>Name:</strong> {viewingLead.firstName}{" "}
                {viewingLead.lastName}
              </p>
              <p>
                <Phone className="inline mr-2" />
                <strong>Phone:</strong> {viewingLead.phoneNumber}
              </p>
              <p>
                <MapPin className="inline mr-2" />
                <strong>Address:</strong> {formatAddress(viewingLead.location)}
              </p>
              <p>
                <ShieldCheck className="inline mr-2" />
                <strong>Status:</strong>{" "}
                <Badge className={getStatusColor(viewingLead.loanStatus)}>
                  {viewingLead.loanStatus}
                </Badge>
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog (for Admins) */}
      <Dialog open={!!editingLead} onOpenChange={() => setEditingLead(null)}>
        <DialogContent className="bg-slate-800/95 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Edit Lead Status</DialogTitle>
            <DialogDescription>
              Update the loan status for {editingLead?.firstName}.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onUpdateSubmit)}
              className="space-y-6 py-4"
            >
              <FormField
                control={editForm.control}
                name="loanStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Contacted">Contacted</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingLead(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit" /* disabled={updateLeadMutation.isPending} */
                >
                  {/* {updateLeadMutation.isPending ? "Saving..." : "Save Changes"} */}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
