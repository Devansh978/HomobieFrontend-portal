import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Target, Users, Search, Filter, User } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TelecallersResponse, LeadsResponse, Telecaller, Lead } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/hooks/use-toast";

const assignLeadSchema = z.object({
  telecallerId: z.number().min(1, "Please select a telecaller"),
  leadIds: z.array(z.number()).min(1, "Please select at least one lead"),
});

type AssignLeadFormData = z.infer<typeof assignLeadSchema>;

interface AssignLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignLeadDialog({ open, onOpenChange }: AssignLeadDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);

  const form = useForm<AssignLeadFormData>({
    resolver: zodResolver(assignLeadSchema),
    defaultValues: {
      telecallerId: 0,
      leadIds: [],
    },
  });

  // Fetch telecallers
  const { data: telecallers = { telecallers: [], total: 0 } } = useQuery<TelecallersResponse>({
    queryKey: ["/api/telecallers"],
    enabled: open,
  });

  // Fetch unassigned leads
  const { data: unassignedLeads = { leads: [], total: 0 } } = useQuery<LeadsResponse>({
    queryKey: ["/api/leads", { assignedToId: null }],
    enabled: open,
  });

  const assignLeadsMutation = useMutation({
    mutationFn: async (data: AssignLeadFormData) => {
      const assignmentPromises = data.leadIds.map(leadId =>
        fetch(`/api/leads/${leadId}/assign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ assignedToId: data.telecallerId }),
        })
      );
      
      const responses = await Promise.all(assignmentPromises);
      
      for (const response of responses) {
        if (!response.ok) {
          throw new Error("Failed to assign some leads");
        }
      }
      
      return responses;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Leads assigned successfully",
        description: `${selectedLeads.length} leads have been assigned to the telecaller.`,
      });
      onOpenChange(false);
      form.reset();
      setSelectedLeads([]);
    },
    onError: (error) => {
      toast({
        title: "Error assigning leads",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AssignLeadFormData) => {
    assignLeadsMutation.mutate({
      ...data,
      leadIds: selectedLeads,
    });
  };

  const handleLeadSelect = (leadId: number, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredLeads = unassignedLeads.leads.filter((lead: any) =>
        lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSelectedLeads(filteredLeads.map((lead: any) => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const filteredLeads = unassignedLeads.leads.filter((lead: any) =>
    lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 bg-transparent border-0 max-h-[90vh] overflow-hidden">
        <GlassCard gradient="neutral" blur="xl" className="p-6 h-full">
          <DialogHeader className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Target className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  Assign Leads
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  Distribute unassigned leads to your telecallers
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6 h-full flex flex-col">
              {/* Telecaller Selection */}
              <FormField
                control={form.control}
                name="telecallerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Select Telecaller</span>
                    </FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value ? field.value.toString() : ""}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Choose a telecaller" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {telecallers.telecallers.map((telecaller: any) => (
                          <SelectItem key={telecaller.id} value={telecaller.id.toString()}>
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                                <span className="text-xs font-semibold text-white">
                                  {telecaller.user.firstName[0]}{telecaller.user.lastName[0]}
                                </span>
                              </div>
                              <span>{telecaller.user.firstName} {telecaller.user.lastName}</span>
                              <Badge variant="outline" className="ml-auto">
                                {telecaller.status}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Search and Filter */}
              <div className="flex items-center space-x-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search leads by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {/* Lead Selection */}
              <div className="flex-1 min-h-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="border-white/30"
                    />
                    <span className="text-white text-sm">
                      Select All ({filteredLeads.length} leads)
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {selectedLeads.length} selected
                  </Badge>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {filteredLeads.map((lead: any) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Checkbox
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={(checked) => handleLeadSelect(lead.id, checked as boolean)}
                        className="border-white/30"
                      />
                      
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {lead.firstName[0]}{lead.lastName[0]}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">
                              {lead.firstName} {lead.lastName}
                            </p>
                            <p className="text-sm text-gray-300">{lead.email}</p>
                          </div>
                          <div className="flex items-center space-x-2 text-right">
                            <div>
                              <Badge variant="outline" className="text-xs">
                                {lead.loanType}
                              </Badge>
                              <p className="text-xs text-gray-400 mt-1">
                                ₹{lead.loanAmount?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {filteredLeads.length === 0 && (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-400">No unassigned leads found</p>
                      <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <div className="text-sm text-gray-400">
                  {selectedLeads.length} leads selected for assignment
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false);
                      setSelectedLeads([]);
                    }}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={assignLeadsMutation.isPending || selectedLeads.length === 0 || !form.getValues('telecallerId')}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {assignLeadsMutation.isPending ? "Assigning..." : `Assign ${selectedLeads.length} Leads`}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </GlassCard>
      </DialogContent>
    </Dialog>
  );
}