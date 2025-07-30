import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, MapPin, Calendar, DollarSign, Users } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/hooks/use-toast";

const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  location: z.string().min(2, "Location is required"),
  type: z.string().min(1, "Project type is required"),
  builder: z.string().min(2, "Builder name is required"),
  description: z.string().optional(),
  totalUnits: z.number().min(1, "Must have at least 1 unit"),
  expectedRevenue: z.number().min(0, "Revenue must be non-negative"),
  completionDate: z.string().min(1, "Completion date is required"),
  priority: z.enum(["high", "medium", "low"]),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      location: "",
      type: "",
      builder: "",
      description: "",
      totalUnits: 0,
      expectedRevenue: 0,
      completionDate: "",
      priority: "medium",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectFormData) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...data,
          status: "planning",
          soldUnits: 0,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create project");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project created successfully",
        description: "Your new project has been added to the system.",
      });
      onOpenChange(false);
      form.reset();
      setStep(1);
    },
    onError: (error) => {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  const nextStep = () => {
    const currentStepFields = step === 1 
      ? ["name", "location", "type", "builder"] 
      : ["totalUnits", "expectedRevenue", "completionDate", "priority"];

    form.trigger(currentStepFields as any).then((isValid) => {
      if (isValid) {
        setStep(step + 1);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 bg-transparent border-0">
        <GlassCard gradient="neutral" blur="xl" className="p-6">
          <DialogHeader className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Building2 className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  Create New Project
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  Step {step} of 3: {step === 1 ? "Basic Information" : step === 2 ? "Project Details" : "Review & Submit"}
                </DialogDescription>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex space-x-2">
              {[1, 2, 3].map((stepNum) => (
                <motion.div
                  key={stepNum}
                  className={`h-2 flex-1 rounded-full ${
                    stepNum <= step ? "bg-emerald-500" : "bg-gray-600"
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: stepNum <= step ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white flex items-center space-x-2">
                            <Building2 className="h-4 w-4" />
                            <span>Project Name</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Luxury Heights"
                              className="bg-white/10 border-white/20 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>Location</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Gurgaon, Haryana"
                              className="bg-white/10 border-white/20 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Project Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                <SelectValue placeholder="Select project type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="residential">Residential</SelectItem>
                              <SelectItem value="commercial">Commercial</SelectItem>
                              <SelectItem value="mixed">Mixed Use</SelectItem>
                              <SelectItem value="luxury">Luxury</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="builder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Builder/Developer</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., DLF Limited"
                              className="bg-white/10 border-white/20 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of the project..."
                            className="bg-white/10 border-white/20 text-white"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="totalUnits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>Total Units</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 150"
                              className="bg-white/10 border-white/20 text-white"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expectedRevenue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white flex items-center space-x-2">
                            <DollarSign className="h-4 w-4" />
                            <span>Expected Revenue (₹)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 50000000"
                              className="bg-white/10 border-white/20 text-white"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="completionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Expected Completion</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="bg-white/10 border-white/20 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Priority Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="high">High Priority</SelectItem>
                              <SelectItem value="medium">Medium Priority</SelectItem>
                              <SelectItem value="low">Low Priority</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">Review Project Details</h3>
                  <div className="bg-white/5 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Project Name:</span>
                        <p className="text-white font-medium">{form.watch("name")}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Location:</span>
                        <p className="text-white font-medium">{form.watch("location")}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Type:</span>
                        <p className="text-white font-medium">{form.watch("type")}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Builder:</span>
                        <p className="text-white font-medium">{form.watch("builder")}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Total Units:</span>
                        <p className="text-white font-medium">{form.watch("totalUnits")}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Expected Revenue:</span>
                        <p className="text-white font-medium">₹{form.watch("expectedRevenue")?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Previous
                  </Button>
                )}
                
                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto bg-emerald-500 hover:bg-emerald-600"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={createProjectMutation.isPending}
                    className="ml-auto bg-emerald-500 hover:bg-emerald-600"
                  >
                    {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </GlassCard>
      </DialogContent>
    </Dialog>
  );
}