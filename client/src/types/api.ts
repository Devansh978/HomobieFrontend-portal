import { ReactNode } from "react";

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;

}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
}

// Project Types
export interface Project {
  title: ReactNode;
  id: number;
  name: string;
  location: string;
  type: string;
  builder: string;
  description?: string;
  status: "planning" | "construction" | "ready" | "sold";
  totalUnits: number;
  soldUnits: number;
  expectedRevenue?: number;
  completionDate?: string;
  priority: "high" | "medium" | "low";
  createdById: number;
  createdAt: string;
  updatedAt: string;
}

// Telecaller Types
export interface TelecallerUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Telecaller {
  id: number;
  userId: number;
  role: string;
  status: "active" | "busy" | "offline" | "break";
  workingHoursStart?: string;
  workingHoursEnd?: string;
  timezone?: string;
  totalCalls: number;
  successfulCalls: number;
  leadsGenerated: number;
  conversions: number;
  efficiency: number;
  createdAt: string;
  updatedAt: string;
  user: TelecallerUser;
}

// Lead Types
export interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  loanType: "home_loan" | "loan_against_property" | "business_loan";
  loanAmount?: number;
  status: "new" | "contacted" | "documents_requested" | "documents_received" | "under_review" | "approved" | "rejected" | "disbursed";
  assignedToId?: number;
  createdAt: string;
  updatedAt: string;
}

// Bank Types
export interface Bank {
  id: number;
  name: string;
  type: string;
  products: string[];
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  priority: "high" | "medium" | "low";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Document Types
export interface DocumentUpload {
  id: number;
  name: string;
  type: string;
  size: number;
  url: string;
  status: "pending" | "approved" | "rejected" | "urgent";
  leadId?: number;
  uploadedById: number;
  createdAt: string;
  updatedAt: string;
}

// API Query Response Types
export interface ProjectsResponse {
  projects: Project[];
  total: number;
}
export interface UpdateProjectsResponse {
  projects: Project[];
  total: number;
}
export interface TelecallersResponse {
  telecallers: Telecaller[];
  total: number;
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
}

export interface BanksResponse {
  banks: Bank[];
  total: number;
}

export interface DocumentsResponse {
  documents: DocumentUpload[];
  total: number;
}