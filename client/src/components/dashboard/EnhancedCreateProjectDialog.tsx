import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  Building2,
  MapPin,
  IndianRupeeIcon,
  Users,
  Calendar,
  Target,
  UserPlus,
  Plus,
  Phone,
  Mail,
  Home,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { GlassCard } from "@/components/ui/glass-card";
import { AuthService } from "@/lib/auth";

const auth = new AuthService();

// Safely get user ID and token with null checks
const getUserId = () => {
  try {
    const authUser = localStorage.getItem("auth_user");
    if (!authUser) return null;
    const parsedUser = JSON.parse(authUser);
    return parsedUser?.userId || null;
  } catch (error) {
    console.error("Error parsing auth_user from localStorage:", error);
    return null;
  }
};

const getToken = () => {
  return (
    localStorage.getItem("auth_token") || localStorage.getItem("token") || ""
  );
};

const userId = getUserId();
const token = getToken();

const createProjectSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  projectType: z.string().min(1, "Project type is required"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
  units: z.number().min(1, "Units must be at least 1"),
  budget: z.number().min(1, "Budget must be greater than 0"),
  description: z.string().optional(),
  completedAt: z.string().optional(),
});

const createLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
  addressLine1: z.string().min(1, "Address is required"),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;
type CreateLeadFormData = z.infer<typeof createLeadSchema>;

// DTO structure for backend - Project
interface CreateProjectDTO {
  builderId: string;
  projectName: string;
  projectType: string;
  location: {
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
  budget: number;
  units: number;
  description?: string;
  status: string;
  completedAt?: string;
}

// DTO structure for backend - Lead
interface CreateLeadDTO {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  roleData: {
    roleType: "USER";
    addedByUserId: string;
    location: {
      country: string;
      state: string;
      city: string;
      pincode: string;
      addressLine1: string;
    };
  };
}

interface EnhancedCreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnhancedCreateProjectDialog({
  open,
  onOpenChange,
}: EnhancedCreateProjectDialogProps) {
  const [activeTab, setActiveTab] = useState("project");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const projectForm = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      projectName: "",
      projectType: "",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
      units: 0,
      budget: 0,
      description: "",
      completedAt: "",
    },
  });

  const leadForm = useForm<CreateLeadFormData>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      country: "India",
      state: "",
      city: "",
      pincode: "",
      addressLine1: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectFormData) => {
      const currentUserId = getUserId();
      const currentToken = getToken();

      if (!currentUserId) {
        throw new Error("User not authenticated. Please log in again.");
      }

      // FORMAT completedAt for LocalDateTime
      let completedAt = undefined;
      if (data.completedAt) {
        // If only date is chosen, append T00:00:00
        completedAt = `${data.completedAt}T00:00:00`;
        // If you have a time picker, combine date and time here.
      }
      // Transform form data to match backend DTO structure
      const dto: CreateProjectDTO = {
        builderId: currentUserId, // Using userId as builderId - adjust if you have a separate builderId
        projectName: data.projectName,
        projectType: data.projectType,
        location: {
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          landmark: data.landmark,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
        },
        budget: data.budget,
        units: data.units,
        description: data.description,
        status: "Active", // Default status
        completedAt: data.completedAt,
      };

      return await apiRequest("/project/add", {
        method: "POST",
        body: dto,
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/project/add"] });
      toast({
        title: "Success",
        description: "Project created successfully!",
      });
      projectForm.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: CreateLeadFormData) => {
      // Transform form data to match backend DTO structure
      const dto: CreateLeadDTO = {
        user: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
        },
        roleData: {
          roleType: "USER",
          addedByUserId: userId,
          location: {
            country: data.country,
            state: data.state,
            city: data.city,
            pincode: data.pincode,
            addressLine1: data.addressLine1,
          },
        },
      };

      return await apiRequest("/register/user", {
        method: "POST",
        body: dto,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/register/user"] });
      console.log(userId)
      toast({
        title: "Success",
        description: "Lead created successfully!",
      });
      leadForm.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create lead",
        variant: "destructive",
      });
    },
  });

  const onProjectSubmit = (data: CreateProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  const onLeadSubmit = (data: CreateLeadFormData) => {
    createLeadMutation.mutate(data);
  };

  // Indian states for dropdown
  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

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
                  <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
                    Create New Project & Lead
                  </DialogTitle>
                  <DialogDescription className="text-center text-gray-300">
                    Add a new project to your portfolio or create a new lead for
                    your telecallers
                  </DialogDescription>
                </DialogHeader>

                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-white/20 border border-white/20">
                    <TabsTrigger
                      value="project"
                      className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-100"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Create Project
                    </TabsTrigger>
                    <TabsTrigger
                      value="lead"
                      className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-100"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User Lead
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="project" className="space-y-6 mt-6">
                    <Form {...projectForm}>
                      <form
                        onSubmit={projectForm.handleSubmit(onProjectSubmit)}
                        className="space-y-6"
                      >
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          <FormField
                            control={projectForm.control}
                            name="projectName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white flex items-center">
                                  <Building2 className="h-4 w-4 mr-2" />
                                  Project Name
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Green Valley Residential Complex"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white-900"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={projectForm.control}
                            name="projectType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">
                                  Project Type
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                      <SelectValue placeholder="Select project type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Residential">
                                      Residential
                                    </SelectItem>
                                    <SelectItem value="Commercial">
                                      Commercial
                                    </SelectItem>
                                    <SelectItem value="Mixed Use">
                                      Mixed Use
                                    </SelectItem>
                                    <SelectItem value="Luxury">
                                      Luxury
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={projectForm.control}
                            name="units"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">
                                  Total Units
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="150"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={projectForm.control}
                            name="budget"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white flex items-center">
                                  <IndianRupeeIcon className="h-4 w-4 mr-2" />
                                  Budget (₹)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="50000000"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={projectForm.control}
                            name="completedAt"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Completion Date
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
                        </motion.div>

                        {/* Location Section */}
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.15 }}
                          className="space-y-4"
                        >
                          <h3 className="text-white text-lg font-medium flex items-center">
                            <MapPin className="h-5 w-5 mr-2" />
                            Location Details
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={projectForm.control}
                              name="addressLine1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">
                                    Address Line 1
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., 123 Main Street"
                                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={projectForm.control}
                              name="addressLine2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">
                                    Address Line 2 (Optional)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., Near City Center"
                                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={projectForm.control}
                              name="landmark"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">
                                    Landmark (Optional)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., Opposite Central Park"
                                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={projectForm.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">
                                    City
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., Mumbai"
                                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={projectForm.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">
                                    State
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                        <SelectValue placeholder="Select state" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {indianStates.map((state) => (
                                        <SelectItem key={state} value={state}>
                                          {state}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={projectForm.control}
                              name="pincode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">
                                    Pincode
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="400001"
                                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <FormField
                            control={projectForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">
                                  Description (Optional)
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="A modern residential complex featuring eco-friendly apartments with world-class amenities..."
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    rows={3}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-white/20 text-blue hover:bg-white/10"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={createProjectMutation.isPending}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                          >
                            {createProjectMutation.isPending
                              ? "Creating..."
                              : "Create Project"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="lead" className="space-y-6 mt-6">
                    <Form {...leadForm}>
                      <form
                        onSubmit={leadForm.handleSubmit(onLeadSubmit)}
                        className="space-y-6"
                      >
                        <motion.div
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="space-y-6"
                        >
                          {/* Personal Information Section */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={leadForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white flex items-center">
                                    <Users className="h-4 w-4 mr-2" />
                                    First Name
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., John"
                                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={leadForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">
                                    Last Name
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., Doe"
                                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={leadForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white flex items-center">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Email Address
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="email"
                                      placeholder="john.doe@example.com"
                                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={leadForm.control}
                              name="phoneNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white flex items-center">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Phone Number
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="9876543210"
                                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Address Information Section */}
                          <div className="space-y-4">
                            <h3 className="text-white text-lg font-medium flex items-center">
                              <Home className="h-5 w-5 mr-2" />
                              Address Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={leadForm.control}
                                name="country"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">
                                      Country
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="India"
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                        {...field}
                                        readOnly
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={leadForm.control}
                                name="state"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">
                                      State
                                    </FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                          <SelectValue placeholder="Select state" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {indianStates.map((state) => (
                                          <SelectItem key={state} value={state}>
                                            {state}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={leadForm.control}
                                name="city"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">
                                      City
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g., Bhopal"
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={leadForm.control}
                                name="pincode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">
                                      Pincode
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="462001"
                                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={leadForm.control}
                              name="addressLine1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">
                                    Address Line
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="123 ABC Tower, MP Nagar"
                                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </motion.div>

                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-white/20 text-blue hover:bg-white/10"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={createLeadMutation.isPending}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                          >
                            {createLeadMutation.isPending
                              ? "Creating..."
                              : "Create Lead"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </GlassCard>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
