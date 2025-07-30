import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Plus, Filter, Search } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lead, STATUS_LABELS, STATUS_COLORS, LOAN_TYPE_LABELS } from "@/lib/types";
import { Input } from "@/components/ui/input";

interface GlassRecentLeadsTableProps {
  leads?: Lead[];
  isLoading?: boolean;
  onAddLead?: () => void;
  onViewLead?: (leadId: number) => void;
  onEditLead?: (leadId: number) => void;
  onFiltersApplied?: (filters: any) => void;
}

export function GlassRecentLeadsTable({ 
  leads = [], 
  isLoading, 
  onAddLead, 
  onViewLead, 
  onEditLead,
  onFiltersApplied 
}: GlassRecentLeadsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
      "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
    ];
    return colors[index % colors.length];
  };

  const filteredLeads = leads.filter(lead =>
    lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <GlassCard className="animate-pulse" gradient="primary" blur="md">
        <div className="p-6">
          <div className="h-6 bg-white/30 rounded mb-4 w-32"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/20 rounded"></div>
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard gradient="primary" blur="md" className="w-full">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Leads</h3>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30"
              />
            </div>
            
            <GlassButton variant="secondary" size="sm" onClick={onAddLead}>
              <Plus size={16} className="mr-1" />
              Add Lead
            </GlassButton>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No leads found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first lead"}
            </p>
            {!searchTerm && (
              <GlassButton variant="primary" onClick={onAddLead}>
                <Plus size={16} className="mr-2" />
                Create your first lead
              </GlassButton>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Lead Info
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Loan Type
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filteredLeads.map((lead, index) => (
                      <motion.tr 
                        key={lead.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: index * 0.05,
                          ease: "easeOut"
                        }}
                        layout
                        className="border-b border-white/5 hover:bg-white/10 transition-all duration-200"
                        onMouseEnter={() => setHoveredRow(lead.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${getAvatarColor(index)} backdrop-blur-sm`}>
                              <span className="font-semibold text-sm">
                                {getInitials(lead.firstName, lead.lastName)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {lead.firstName} {lead.lastName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{lead.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                          {LOAN_TYPE_LABELS[lead.loanType]}
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(lead.loanAmount)}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`status-badge ${STATUS_COLORS[lead.status]} backdrop-blur-sm`}>
                            {STATUS_LABELS[lead.status]}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <GlassButton
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewLead?.(lead.id)}
                              className="!p-2"
                            >
                              <Eye size={16} />
                            </GlassButton>
                            <GlassButton
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditLead?.(lead.id)}
                              className="!p-2"
                            >
                              <Edit size={16} />
                            </GlassButton>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredLeads.map((lead, index) => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.05,
                      ease: "easeOut"
                    }}
                    layout
                  >
                    <GlassCard gradient="secondary" blur="sm" className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${getAvatarColor(index)} backdrop-blur-sm`}>
                            <span className="font-semibold text-sm">
                              {getInitials(lead.firstName, lead.lastName)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-lg">
                              {lead.firstName} {lead.lastName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{lead.email}</p>
                          </div>
                        </div>
                        <Badge className={`status-badge ${STATUS_COLORS[lead.status]} backdrop-blur-sm`}>
                          {STATUS_LABELS[lead.status]}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Loan Type:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{LOAN_TYPE_LABELS[lead.loanType]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(lead.loanAmount)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <GlassButton
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={() => onViewLead?.(lead.id)}
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </GlassButton>
                        <GlassButton
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          onClick={() => onEditLead?.(lead.id)}
                        >
                          <Edit size={16} className="mr-1" />
                          Edit
                        </GlassButton>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </GlassCard>
  );
}