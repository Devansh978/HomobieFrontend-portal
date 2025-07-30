
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin, Clock, CheckCircle } from "lucide-react";
import { authenticatedFetch } from "@/lib/auth";
import { Lead, LeadTimeline } from "@/lib/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";

export function Tracking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { data: leadsData, isLoading } = useQuery({
    queryKey: ["/api/leads", { search: searchTerm, status: statusFilter !== "all" ? statusFilter : undefined }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);
      
      const response = await authenticatedFetch(`/api/leads?${params.toString()}`);
      return response.json();
    },
  });

  const { data: timeline } = useQuery({
    queryKey: ["/api/leads", selectedLead?.id, "timeline"],
    queryFn: async () => {
      if (!selectedLead) return [];
      const response = await authenticatedFetch(`/api/leads/${selectedLead.id}/timeline`);
      return response.json();
    },
    enabled: !!selectedLead,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Lead Tracking</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads List */}
        <Card>
          <CardHeader>
            <CardTitle>Leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse p-4 border rounded">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              leadsData?.leads?.map((lead: Lead) => (
                <div
                  key={lead.id}
                  className={`p-4 border rounded cursor-pointer transition-colors ${
                    selectedLead?.id === lead.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedLead(lead)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{lead.firstName} {lead.lastName}</h3>
                    <Badge className={STATUS_COLORS[lead.status]}>
                      {STATUS_LABELS[lead.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{lead.email}</p>
                  <p className="text-sm text-gray-600">{lead.phone}</p>
                  <p className="text-sm text-gray-600">₹{lead.loanAmount.toLocaleString()}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Lead Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedLead ? `Timeline - ${selectedLead.firstName} ${selectedLead.lastName}` : "Select a Lead"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedLead ? (
              <div className="space-y-4">
                {timeline?.map((entry: LeadTimeline) => (
                  <div key={entry.id} className="flex items-start space-x-3">
                    <div className="mt-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Badge className={STATUS_COLORS[entry.status]}>
                          {STATUS_LABELS[entry.status]}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>Select a lead to view its tracking timeline</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
