import { useState } from "react";
import { X, User, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreateLeadForm, LoanType, LeadStatus, LOAN_TYPE_LABELS, STATUS_LABELS } from "@/lib/types";

const leadFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  loanType: z.enum(["home_loan", "loan_against_property", "business_loan"]),
  loanAmount: z.number().min(1, "Loan amount must be greater than 0"),
  assignedToId: z.number().optional(),
  notes: z.string().optional(),
});

interface LeadManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeadForm) => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
  initialData?: Partial<CreateLeadForm>;
}

interface TimelineItem {
  status: LeadStatus;
  title: string;
  time: string;
  isCompleted: boolean;
}

export function LeadManagementModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  mode = "create",
  initialData,
}: LeadManagementModalProps) {
  const [currentStatus, setCurrentStatus] = useState<LeadStatus>("new");
  
  const mockTimeline: TimelineItem[] = [
    { status: "new", title: "Lead Created", time: "Today, 10:30 AM", isCompleted: true },
    { status: "contacted", title: "Initial Contact", time: "Pending", isCompleted: false },
    { status: "documents_requested", title: "Document Collection", time: "Pending", isCompleted: false },
    { status: "under_review", title: "Application Review", time: "Pending", isCompleted: false },
  ];

  const mockTeamMembers = [
    { id: 1, name: "Sarah Wilson" },
    { id: 2, name: "Mike Johnson" },
    { id: 3, name: "Lisa Chen" },
    { id: 4, name: "David Kumar" },
  ];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreateLeadForm>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      loanType: initialData?.loanType || "home_loan",
      loanAmount: initialData?.loanAmount || 0,
      assignedToId: initialData?.assignedToId,
      notes: initialData?.notes || "",
    },
  });

  const handleFormSubmit = (data: CreateLeadForm) => {
    onSubmit(data);
    if (mode === "create") {
      reset();
    }
  };

  const handleClose = () => {
    if (mode === "create") {
      reset();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-cred-dark">
            {mode === "create" ? "Create New Lead" : "Edit Lead"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Information Form */}
            <div className="space-y-4">
              <h4 className="font-semibold text-cred-dark">Lead Information</h4>
              
              <div>
                <Label htmlFor="firstName">Full Name *</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <Input
                      id="firstName"
                      placeholder="First name"
                      {...register("firstName")}
                      className="focus:ring-cred-mint border-gray-300"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      placeholder="Last name"
                      {...register("lastName")}
                      className="focus:ring-cred-mint border-gray-300"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    {...register("email")}
                    className="mt-1 focus:ring-cred-mint border-gray-300"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    {...register("phone")}
                    className="mt-1 focus:ring-cred-mint border-gray-300"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loanType">Loan Type *</Label>
                  <Select
                    value={watch("loanType")}
                    onValueChange={(value: LoanType) => setValue("loanType", value)}
                  >
                    <SelectTrigger className="mt-1 focus:ring-cred-mint border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LOAN_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.loanType && (
                    <p className="text-red-500 text-xs mt-1">{errors.loanType.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="loanAmount">Loan Amount *</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    placeholder="₹ 0"
                    {...register("loanAmount", { valueAsNumber: true })}
                    className="mt-1 focus:ring-cred-mint border-gray-300"
                  />
                  {errors.loanAmount && (
                    <p className="text-red-500 text-xs mt-1">{errors.loanAmount.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="assignedTo">Assign To</Label>
                <Select
                  value={watch("assignedToId")?.toString()}
                  onValueChange={(value) => setValue("assignedToId", parseInt(value))}
                >
                  <SelectTrigger className="mt-1 focus:ring-cred-mint border-gray-300">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTeamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="Add any notes or comments..."
                  {...register("notes")}
                  className="mt-1 focus:ring-cred-mint border-gray-300"
                />
              </div>
            </div>

            {/* Timeline and Status */}
            <div className="space-y-4">
              <h4 className="font-semibold text-cred-dark">Timeline & Status</h4>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {mockTimeline.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        item.isCompleted ? "bg-cred-mint" : "bg-gray-300"
                      }`}></div>
                      <div className="flex-1">
                        <p className={`text-sm ${
                          item.isCompleted ? "font-medium text-gray-900" : "text-gray-500"
                        }`}>
                          {item.title}
                        </p>
                        <p className={`text-xs ${
                          item.isCompleted ? "text-gray-500" : "text-gray-400"
                        }`}>
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {mode === "edit" && (
                <div className="space-y-3">
                  <Label>Status Update</Label>
                  <Select
                    value={currentStatus}
                    onValueChange={(value: LeadStatus) => setCurrentStatus(value)}
                  >
                    <SelectTrigger className="focus:ring-cred-mint border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-800">
                  <User size={16} />
                  <span className="text-sm font-medium">Lead Information</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  All fields marked with * are required. Ensure accurate information for better processing.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-cred-mint text-cred-dark hover:bg-cred-mint/90"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : (mode === "create" ? "Create Lead" : "Update Lead")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
