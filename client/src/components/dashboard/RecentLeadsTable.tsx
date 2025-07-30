import { Eye, Edit, Filter, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lead, STATUS_LABELS, LOAN_TYPE_LABELS, STATUS_COLORS } from "@/lib/types";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LeadsFilter } from "./LeadsFilter";

interface RecentLeadsTableProps {
  leads?: Lead[];
  isLoading?: boolean;
  onAddLead?: () => void;
  onViewLead?: (leadId: number) => void;
  onEditLead?: (leadId: number) => void;
  onFiltersApplied?: (filters: any) => void;
}

export function RecentLeadsTable({ 
  leads = [], 
  isLoading, 
  onAddLead, 
  onViewLead, 
  onEditLead,
  onFiltersApplied 
}: RecentLeadsTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    loanType: "all",
    assignedTo: "",
    minAmount: "",
    maxAmount: "",
  });

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersApplied?.(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: "",
      status: "all",
      loanType: "all",
      assignedTo: "",
      minAmount: "",
      maxAmount: "",
    };
    setFilters(clearedFilters);
    onFiltersApplied?.(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== "all") count++;
    if (filters.loanType !== "all") count++;
    if (filters.assignedTo) count++;
    if (filters.minAmount) count++;
    if (filters.maxAmount) count++;
    return count;
  };

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-cred-dark">Recent Leads</h3>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter size={16} className="mr-1" />
                Filter
              </Button>
              <Button size="sm" className="bg-cred-mint text-cred-dark hover:bg-cred-mint/90">
                <Plus size={16} className="mr-1" />
                Add Lead
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                    <div className="w-48 h-3 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600", 
      "bg-purple-100 text-purple-600",
      "bg-orange-100 text-orange-600",
      "bg-pink-100 text-pink-600"
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="p-4 md:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-cred-dark">Recent Leads</h3>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button 
              size="sm" 
              className="bg-cred-mint text-cred-dark hover:bg-cred-mint/90 flex-1 sm:flex-none"
              onClick={onAddLead}
            >
              <Plus size={16} className="mr-1" />
              Add Lead
            </Button>
          </div>
        </div>
        
        {/* Filter Component */}
        <div className="mt-4">
          <LeadsFilter
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
            activeFiltersCount={getActiveFiltersCount()}
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {leads.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No leads found</p>
            <Button 
              className="mt-4 bg-cred-mint text-cred-dark hover:bg-cred-mint/90"
              onClick={onAddLead}
            >
              <Plus size={16} className="mr-2" />
              Create your first lead
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead Info
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan Type
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <AnimatePresence mode="popLayout">
                    {leads.map((lead, index) => (
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
                        className="hover:bg-gray-50 transition-all duration-200"
                        onMouseEnter={() => setHoveredRow(lead.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        whileHover={{ scale: 1.01 }}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${getAvatarColor(index)}`}>
                              <span className="font-semibold text-sm">
                                {getInitials(lead.firstName, lead.lastName)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-cred-dark">
                                {lead.firstName} {lead.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{lead.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-900">
                          {LOAN_TYPE_LABELS[lead.loanType]}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-cred-dark">
                          {formatCurrency(lead.loanAmount)}
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={`status-badge ${STATUS_COLORS[lead.status]}`}>
                            {STATUS_LABELS[lead.status]}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-cred-mint hover:text-cred-mint/80 hover:bg-cred-mint/10"
                              onClick={() => onViewLead?.(lead.id)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                              onClick={() => onEditLead?.(lead.id)}
                            >
                              <Edit size={16} />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 p-4">
              <AnimatePresence mode="popLayout">
                {leads.map((lead, index) => (
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
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${getAvatarColor(index)}`}>
                          <span className="font-semibold text-sm">
                            {getInitials(lead.firstName, lead.lastName)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-cred-dark text-lg">
                            {lead.firstName} {lead.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{lead.email}</p>
                        </div>
                      </div>
                      <Badge className={`status-badge ${STATUS_COLORS[lead.status]}`}>
                        {STATUS_LABELS[lead.status]}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Loan Type:</span>
                        <span className="text-sm font-medium">{LOAN_TYPE_LABELS[lead.loanType]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="text-sm font-medium text-cred-dark">{formatCurrency(lead.loanAmount)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-cred-mint border-cred-mint hover:bg-cred-mint hover:text-white"
                        onClick={() => onViewLead?.(lead.id)}
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onEditLead?.(lead.id)}
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
          
        )}
      </CardContent>
    </Card>
  );
}
