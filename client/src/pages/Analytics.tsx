import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Download,
  Calendar as CalendarIcon,
  Users,
  DollarSign,
  FileText,
  Target,
} from "lucide-react";
import { authenticatedFetch } from "@/lib/auth";
import { format } from "date-fns";
import { EnhancedRoleBasedNavbar } from "@/components/layout/EnhancedRoleBasedNavbar";

interface TotalAndAverageData {
  total: number;
  average: number;
}

interface LeadsCountByStatus {
  [status: string]: number;
}

interface ActiveUsersData {
  count: number;
}

interface MonthlyUsersData {
  month: string;
  count: number;
}

const BASE_URL = "http://homobie.ap-south-1.elasticbeanstalk.com";

// Updated based on backend enum values from error messages
const STATUS_OPTIONS = ["PENDING", "CONTACTED", "QUALIFIED", "CONVERTED", "REJECTED", "NO_LOANS"];
const ROLE_OPTIONS = ["ADMIN", "BUILDER", "BROKER", "USER"]; // Updated to uppercase based on error

const getToken = () => {
  return localStorage.getItem("auth_token") || localStorage.getItem("token") || "";
};

export default function Analytics() {
  const { user, logout } = useAuth();

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1),
    to: new Date(),
  });
  const [reportType, setReportType] = useState("overview");
  const [selectedStatus, setSelectedStatus] = useState<string>("PENDING"); // Changed to uppercase
  const [selectedRole, setSelectedRole] = useState<string>("BUILDER"); // Changed to uppercase

  // Fetch total and average data - requires status parameter
  const { data: totalAndAverageData } = useQuery<TotalAndAverageData>({
    queryKey: ["totalAndAverage", selectedStatus, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("status", selectedStatus);
      if (dateRange.from) params.append("from", dateRange.from.toISOString());
      if (dateRange.to) params.append("to", dateRange.to.toISOString());

      const response = await authenticatedFetch(
        `${BASE_URL}/analytics/getTotalAndAverage?${params.toString()}`
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch total and average data");
      }
      return response.json();
    },
  });

  // Fetch leads count by status - requires status parameter
  const { data: leadsCountByStatus } = useQuery<LeadsCountByStatus>({
  queryKey: ["leadsCountByStatus", dateRange], // Removed selectedStatus from queryKey since we're hardcoding it
  queryFn: async () => {
    const params = new URLSearchParams();
    params.append("status", "NEW"); // Hardcoded to always request NEW status
    if (dateRange.from) params.append("from", dateRange.from.toISOString());
    if (dateRange.to) params.append("to", dateRange.to.toISOString());

    const response = await authenticatedFetch(
      `${BASE_URL}/analytics/getLeadsCountByStatus?${params.toString()}`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch leads count by status");
    }
    return response.json();
  },
});

  // Fetch total active users - works correctly
  const { data: totalActiveUsers } = useQuery<ActiveUsersData>({
    queryKey: ["totalActiveUsers"],
    queryFn: async () => {
      const response = await authenticatedFetch(
        `${BASE_URL}/analytics/count-total-active-users`
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch total active users");
      }
      return response.json();
    },
  });

  // Fetch monthly users by role - works correctly
  // In your monthly users by role query, ensure the response is always treated as an array
const { data: monthlyUsersByRole } = useQuery<MonthlyUsersData[]>({
  queryKey: ["monthlyUsersByRole", selectedRole, dateRange],
  queryFn: async () => {
    const params = new URLSearchParams();
    params.append("role", selectedRole);
    if (dateRange.from) params.append("from", dateRange.from.toISOString());
    if (dateRange.to) params.append("to", dateRange.to.toISOString());

    const response = await authenticatedFetch(
      `${BASE_URL}/analytics/count-monthly-users-by-role?${params.toString()}`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch monthly users by role");
    }
    const data = await response.json();
    // Ensure we always return an array, even if the API returns something else
    return Array.isArray(data) ? data : [];
  },
});


  // Fetch active users by role - requires role parameter in uppercase
  const { data: activeUsersByRole } = useQuery<ActiveUsersData>({
    queryKey: ["activeUsersByRole", selectedRole],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("role", selectedRole);

      const response = await authenticatedFetch(
        `${BASE_URL}/analytics/count-active-users-by-role?${params.toString()}`
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch active users by role");
      }
      return response.json();
    },
  });

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  const exportReport = async () => {
    try {
      const blob = new Blob(["Analytics Report Data"], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const isLoading = !totalAndAverageData || !leadsCountByStatus || !totalActiveUsers;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <EnhancedRoleBasedNavbar user={user} onLogout={logout} />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics & Reports
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview Report</SelectItem>
              <SelectItem value="leads">Lead Analysis</SelectItem>
              <SelectItem value="users">User Analytics</SelectItem>
              <SelectItem value="financial">Financial Report</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from
                  ? format(dateRange.from, "MMM dd")
                  : "Pick date"}
                {dateRange.to && ` - ${format(dateRange.to, "MMM dd")}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => setDateRange(range || {})}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Status Selector */}
      <div className="flex items-center space-x-4">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-lg font-semibold">
          {leadsCountByStatus?.[selectedStatus] || 0} leads with status "{selectedStatus}"
        </div>
      </div>

      {/* Role Selector */}
      <div className="flex items-center space-x-4">
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-lg font-semibold">
          {activeUsersByRole?.count || 0} active {selectedRole} users
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAndAverageData?.total || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Value
            </CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalAndAverageData?.average || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalActiveUsers?.count || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active {selectedRole} Users
            </CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeUsersByRole?.count || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Leads by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leadsCountByStatus && Object.entries(leadsCountByStatus).map(
                ([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {status}
                    </Badge>
                    <span className="font-semibold">{count}</span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Users by Role */}
        <Card>
  <CardHeader>
    <CardTitle>Monthly Users ({selectedRole})</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {Array.isArray(monthlyUsersByRole) && monthlyUsersByRole.length > 0 ? (
        monthlyUsersByRole.map((month) => (
          <div key={month.month} className="flex items-center justify-between">
            <span className="text-sm font-medium">{month.month}</span>
            <div className="text-right">
              <div className="text-sm font-semibold">
                {month.count} users
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-sm text-gray-500">No monthly user data available</div>
      )}
    </div>
  </CardContent>
</Card>
      </div>
    </div>
  );
}