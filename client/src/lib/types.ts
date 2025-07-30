export type UserRole = "super_admin" | "admin" | "ca" | "builder" | "broker" | "user" | "telecaller";

export type LeadStatus =
  | "new"
  | "contacted"
  | "documents_requested"
  | "documents_received"
  | "under_review"
  | "approved"
  | "rejected"
  | "disbursed";

export type LoanType = "home_loan" | "loan_against_property" | "business_loan";

export interface registrationData {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "USER" | "BUILDER" | "BROKER" | "CA" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface LoginCredentials {
  username: string;
  password: string;

}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  loanType: LoanType;
  loanAmount: number;
  status: LeadStatus;
  assignedToId?: number;
  createdById: number;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface LeadTimeline {
  id: number;
  leadId: number;
  status: LeadStatus;
  notes?: string;
  changedById: number;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  resourceType: string;
  resourceId?: number;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface DashboardMetrics {
  newLeads: number;
  conversions: number;
  pendingApprovals: number;
  totalLoanValue: number;
}

export interface CrmIntegration {
  id: number;
  name: string;
  type: string;
  config: Record<string, any>;
  isActive: boolean;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Form types
export interface CreateLeadForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  loanType: LoanType;
  loanAmount: number;
  assignedToId?: number;
  notes?: string;
}

export interface CreateUserForm {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
}

// Utility types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// Status display helpers
export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  documents_requested: "Documents Requested",
  documents_received: "Documents Received",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  disbursed: "Disbursed",
};

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  home_loan: "Home Loan",
  loan_against_property: "Loan Against Property",
  business_loan: "Business Loan",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  ca: "CA (Chartered Accountant)",
  builder: "Builder",
  broker: "Broker",
  user: "User",
  telecaller: "Telecaller"
};

// Color mapping for statuses
export const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  documents_requested: "bg-orange-100 text-orange-800",
  documents_received: "bg-purple-100 text-purple-800",
  under_review: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  disbursed: "bg-emerald-100 text-emerald-800",
};
