import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Search, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LeadsFilterProps {
  filters: {
    search: string;
    status: string;
    loanType: string;
    assignedTo: string;
    minAmount?: string;
    maxAmount?: string;
  };
  onFiltersChange: (filters: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
  activeFiltersCount: number;
}

export function LeadsFilter({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  isOpen,
  onToggle,
  activeFiltersCount,
}: LeadsFilterProps) {
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "documents_requested", label: "Documents Requested" },
    { value: "documents_received", label: "Documents Received" },
    { value: "under_review", label: "Under Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "disbursed", label: "Disbursed" },
  ];

  const loanTypeOptions = [
    { value: "all", label: "All Loan Types" },
    { value: "home_loan", label: "Home Loan" },
    { value: "loan_against_property", label: "Loan Against Property" },
    { value: "business_loan", label: "Business Loan" },
  ];

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onToggle}
              className="flex items-center space-x-2"
            >
              <Filter size={16} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  {activeFiltersCount}
                </Badge>
              )}
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} />
              </motion.div>
            </Button>
          </motion.div>

          {/* Quick Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Quick search..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10 w-64"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onApplyFilters();
                }
              }}
            />
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={16} className="mr-1" />
              Clear all
            </Button>
          </motion.div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => handleFilterChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Loan Type Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Loan Type</label>
                    <Select
                      value={filters.loanType}
                      onValueChange={(value) => handleFilterChange("loanType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select loan type" />
                      </SelectTrigger>
                      <SelectContent>
                        {loanTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Min Amount</label>
                    <Input
                      type="number"
                      placeholder="₹0"
                      value={filters.minAmount || ""}
                      onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Max Amount</label>
                    <Input
                      type="number"
                      placeholder="₹∞"
                      value={filters.maxAmount || ""}
                      onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearFilters}
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={onApplyFilters}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {filters.search && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Search: {filters.search}</span>
              <X
                size={12}
                className="cursor-pointer hover:text-red-500"
                onClick={() => handleFilterChange("search", "")}
              />
            </Badge>
          )}
          {filters.status && filters.status !== "all" && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Status: {filters.status}</span>
              <X
                size={12}
                className="cursor-pointer hover:text-red-500"
                onClick={() => handleFilterChange("status", "all")}
              />
            </Badge>
          )}
          {filters.loanType && filters.loanType !== "all" && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Type: {filters.loanType}</span>
              <X
                size={12}
                className="cursor-pointer hover:text-red-500"
                onClick={() => handleFilterChange("loanType", "all")}
              />
            </Badge>
          )}
        </motion.div>
      )}
    </div>
  );
}