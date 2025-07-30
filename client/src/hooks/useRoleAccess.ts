// lib/hooks/useRoleAccess.ts
import { useMemo } from 'react';
import { authService } from '@/lib/auth';

interface RoleAccess {
  canManageUsers: boolean;
  canManageAllLeads: boolean;
  canViewAuditLogs: boolean;
  canManageCrmIntegrations: boolean;
  canAssignLeads: boolean;
  canDeleteLeads: boolean;
  canViewOwnLeads: boolean;
  canCreateLeads: boolean;
  canManageOwnLeads: boolean;
}

const DEFAULT_ACCESS: RoleAccess = {
  canManageUsers: false,
  canManageAllLeads: false,
  canViewAuditLogs: false,
  canManageCrmIntegrations: false,
  canAssignLeads: false,
  canDeleteLeads: false,
  canViewOwnLeads: false,
  canCreateLeads: false,
  canManageOwnLeads: false,
};

export function useRoleAccess(): RoleAccess {
  const user = authService.getUser();

  return useMemo(() => {
    if (!user) {
      return DEFAULT_ACCESS;
    }

    try {
      return {
        canManageUsers: authService.hasPermission('manage_users'),
        canManageAllLeads: authService.hasPermission('manage_all_leads'),
        canViewAuditLogs: authService.hasPermission('view_audit_logs'),
        canManageCrmIntegrations: authService.hasPermission('manage_crm_integrations'),
        canAssignLeads: authService.hasPermission('assign_leads'),
        canDeleteLeads: authService.hasPermission('delete_leads'),
        canViewOwnLeads: authService.hasPermission('view_own_leads'),
        canCreateLeads: authService.hasPermission('create_leads'),
        canManageOwnLeads: authService.hasPermission('manage_own_leads'),
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return DEFAULT_ACCESS;
    }
  }, [user]);
}