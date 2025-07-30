import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Create axios instance with auth headers
const api = axios.create({
  baseURL: API_BASE_URL || 'https://homobiebackend-railway-production.up.railway.app',
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const { getToken } = useAuth();
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Project {
  id: number;
  name: string;
  title: string;
  type: string;
  location: string;
  builder: string;
  totalUnits: number;
  expectedRevenue: number;
  completionDate: string;
  status: 'planning' | 'construction' | 'ready' | 'hold';
}

export interface Telecaller {
  id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  role: 'telecaller' | 'team_lead' | 'manager';
  status: 'active' | 'inactive' | 'on_leave';
  totalCalls: number;
}

export interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  loanType: string;
  loanAmount: number;
  status: 'new' | 'contacted' | 'assigned' | 'converted' | 'rejected';
  assignedTo?: number | null;
}

export interface DashboardStats {
  activeProjects: number;
  activeProjectsChange: string;
  totalTelecallers: number;
  telecallersChange: string;
  unassignedLeads: number;
  leadsChange: string;
  completedProjects: number;
  completedProjectsChange: string;
}

export interface CreateProjectData {
  name: string;
  title: string;
  type: string;
  location: string;
  builder: string;
  totalUnits: number;
  expectedRevenue: number;
  completionDate: string;
}

export interface CreateTeamMemberData {
  email: string;
  firstName: string;
  lastName: string;
  role: 'telecaller' | 'team_lead' | 'manager';
}

export interface AssignLeadsData {
  leadIds: number[];
  telecallerId: number;
}

// Dashboard data fetchers
export const fetchProjects = async (): Promise<Project[]> => {
  const response = await api.get('/projects');
  return response.data;
};

export const fetchTelecallers = async (): Promise<Telecaller[]> => {
  const response = await api.get('/team/telecallers');
  return response.data;
};

export const fetchLeads = async (): Promise<Lead[]> => {
  const response = await api.get('/leads');
  return response.data;
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

// Mutation functions
export const createProject = async (data: CreateProjectData): Promise<Project> => {
  const response = await api.post('/projects', data);
  return response.data;
};

export const createTeamMember = async (data: CreateTeamMemberData): Promise<Telecaller> => {
  const response = await api.post('/team', data);
  return response.data;
};

export const assignLeads = async (data: AssignLeadsData): Promise<void> => {
  await api.post('/leads/assign', data);
};