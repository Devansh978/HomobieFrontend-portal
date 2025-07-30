import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { UserCheck, Phone, Mail, Target, Users, Search, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { GlassCard } from "@/components/ui/glass-card";

const assignLeadSchema = z.object({
  leadId: z.number(),
  telecallerId: z.number().min(1, "Please select a telecaller"),
  priority: z.string().optional(),
  notes: z.string().optional(),
});

type AssignLeadFormData = z.infer<typeof assignLeadSchema>;

interface TelecallerWithUser {
  id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  role: string;
  status: string;
  totalCalls: number;
}

interface EnhancedAssignLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLeads?: any[];
}

export function EnhancedAssignLeadDialog({ 
  open, 
  onOpenChange, 
  selectedLeads = [] 
}: EnhancedAssignLeadDialogProps) {
  const [selectedTelecaller, setSelectedTelecaller] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AssignLeadFormData>({
    resolver: zodResolver(assignLeadSchema),
    defaultValues: {
      leadId: selectedLeads[0]?.id || 0,
      telecallerId: 0,
      priority: "medium",
      notes: "",
    },
  });

  // Fetch telecallers
  const { data: telecallersData = { telecallers: [], total: 0 } } = useQuery<{telecallers: TelecallerWithUser[], total: number}>({
    queryKey: ["/api/telecallers"],
    refetchInterval: 30000,
  });

  const assignLeadMutation = useMutation({
    mutationFn: async (data: AssignLeadFormData) => {
      return await apiRequest(`/api/leads/${data.leadId}/assign`, {
        method: "POST",
        body: {
          assignedToId: data.telecallerId,
          priority: data.priority,
          notes: data.notes,
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Lead assigned successfully!",
      });
      form.reset();
      setSelectedTelecaller(null);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign lead",
        variant: "destructive",
      });
    },
  });

  const filteredTelecallers = telecallersData.telecallers?.filter((telecaller: TelecallerWithUser) =>
    telecaller.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    telecaller.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    telecaller.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const onSubmit = (data: AssignLeadFormData) => {
    if (!selectedTelecaller) {
      toast({
        title: "Error",
        description: "Please select a telecaller",
        variant: "destructive",
      });
      return;
    }
    
    assignLeadMutation.mutate({
      ...data,
      telecallerId: selectedTelecaller,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-transparent border-none p-0">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard gradient="neutral" blur="xl" className="p-8">
                <DialogHeader className="space-y-4 mb-6">
                  <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                    Assign Lead to Telecaller
                  </DialogTitle>
                  <DialogDescription className="text-center text-gray-300">
                    Select a telecaller to assign this lead and track follow-ups
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Lead Information */}
                  {selectedLeads.length > 0 && (
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <GlassCard gradient="neutral" blur="md" className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <Target className="h-5 w-5 mr-2" />
                          Lead Details
                        </h3>
                        <div className="space-y-2">
                          {selectedLeads.map((lead, index) => (
                            <div key={lead.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-semibold text-white">
                                    {lead.firstName[0]}{lead.lastName[0]}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-white">{lead.firstName} {lead.lastName}</p>
                                  <p className="text-sm text-gray-300">{lead.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{lead.loanType}</Badge>
                                <Badge variant="secondary">₹{lead.loanAmount?.toLocaleString()}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    </motion.div>
                  )}

                  {/* Search Telecallers */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search telecallers by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </motion.div>

                  {/* Telecaller Selection */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Available Telecallers ({filteredTelecallers.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                      {filteredTelecallers.map((telecaller: TelecallerWithUser) => (
                        <motion.div
                          key={telecaller.id}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setSelectedTelecaller(telecaller.user.id)}
                          className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
                            selectedTelecaller === telecaller.user.id
                              ? "border-emerald-500 bg-emerald-500/10"
                              : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="" alt={telecaller.user.firstName} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white">
                                {telecaller.user.firstName[0]}{telecaller.user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-white">
                                {telecaller.user.firstName} {telecaller.user.lastName}
                              </p>
                              <p className="text-sm text-gray-300 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {telecaller.user.email}
                              </p>
                            </div>
                            {selectedTelecaller === telecaller.user.id && (
                              <CheckCircle className="h-5 w-5 text-emerald-400" />
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Status:</span>
                              <Badge 
                                variant={telecaller.status === "active" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {telecaller.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Calls:</span>
                              <span className="text-blue-400 font-semibold">{telecaller.totalCalls}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Assignment Form */}
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Priority Level</FormLabel>
                              <FormControl>
                                <select
                                  {...field}
                                  className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white"
                                >
                                  <option value="low" className="bg-gray-800">Low</option>
                                  <option value="medium" className="bg-gray-800">Medium</option>
                                  <option value="high" className="bg-gray-800">High</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Assignment Notes</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Additional instructions for telecaller..."
                                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <DialogFooter className="mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => onOpenChange(false)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={assignLeadMutation.isPending || !selectedTelecaller}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                        >
                          {assignLeadMutation.isPending ? "Assigning..." : "Assign Lead"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </div>
              </GlassCard>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}