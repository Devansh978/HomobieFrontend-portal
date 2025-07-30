import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Mail, User, Shield, Phone } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/hooks/use-toast";

const addUserSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  role: z.enum(["telecaller", "broker", "ca"]),
  phone: z.string().optional(),
  workingHoursStart: z.string().optional(),
  workingHoursEnd: z.string().optional(),
  timezone: z.string().optional(),
});

type AddUserFormData = z.infer<typeof addUserSchema>;

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      role: "telecaller",
      phone: "",
      workingHoursStart: "09:00",
      workingHoursEnd: "18:00",
      timezone: "Asia/Kolkata",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: AddUserFormData) => {
      // First create the user
      const userResponse = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          username: data.username,
          role: data.role,
          password: "tempPassword123", // Temporary password
        }),
      });
      
      if (!userResponse.ok) {
        throw new Error("Failed to create user");
      }
      
      const user = await userResponse.json();

      // If creating a telecaller, also create telecaller profile
      if (data.role === "telecaller") {
        const telecallerResponse = await fetch("/api/telecallers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userId: user.id,
            role: "telecaller",
            status: "active",
            workingHoursStart: data.workingHoursStart,
            workingHoursEnd: data.workingHoursEnd,
            timezone: data.timezone,
            totalCalls: 0,
            successfulCalls: 0,
            leadsGenerated: 0,
            conversions: 0,
            efficiency: 0,
          }),
        });
        
        if (!telecallerResponse.ok) {
          throw new Error("Failed to create telecaller profile");
        }
      }
      
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/telecallers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User added successfully",
        description: "The new team member has been invited to the system.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error adding user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddUserFormData) => {
    createUserMutation.mutate(data);
  };

  const roleDescriptions = {
    telecaller: "Can make calls, update lead statuses, and manage assigned leads",
    broker: "Can add leads, view timelines, and manage client relationships",
    ca: "Can access legal documents, financial records, and compliance data",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 bg-transparent border-0">
        <GlassCard gradient="neutral" blur="xl" className="p-6">
          <DialogHeader className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <UserPlus className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  Add Team Member
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  Invite a new member to your team
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>First Name</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
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
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email Address</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
                        className="bg-white/10 border-white/20 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="johndoe"
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>Phone (Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+91 98765 43210"
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Role</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="telecaller">Telecaller</SelectItem>
                        <SelectItem value="broker">Broker</SelectItem>
                        <SelectItem value="ca">CA (Chartered Accountant)</SelectItem>
                      </SelectContent>
                    </Select>
                    {field.value && (
                      <p className="text-xs text-gray-400 mt-1">
                        {roleDescriptions[field.value as keyof typeof roleDescriptions]}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("role") === "telecaller" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-medium text-white">Telecaller Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="workingHoursStart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Start Time</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
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
                      name="workingHoursEnd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">End Time</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              className="bg-white/10 border-white/20 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
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
                  disabled={createUserMutation.isPending}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {createUserMutation.isPending ? "Adding..." : "Add Member"}
                </Button>
              </div>
            </form>
          </Form>
        </GlassCard>
      </DialogContent>
    </Dialog>
  );
}