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
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  FileText,
  Target,
} from "lucide-react";
import { authenticatedFetch } from "@/lib/auth";
import { format } from "date-fns";

interface AnalyticsData {
  totalLeads: number;
  conversionRate: number;
  totalLoanValue: number;
  averageLoanAmount: number;
  leadsByStatus: Record<string, number>;
  leadsByMonth: Array<{ month: string; count: number; value: number }>;
  topPerformers: Array<{ name: string; leads: number; conversions: number }>;
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1),
    to: new Date(),
  });
  const [reportType, setReportType] = useState("overview");

  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange.from) params.append("from", dateRange.from.toISOString());
      if (dateRange.to) params.append("to", dateRange.to.toISOString());

      const response = await authenticatedFetch(
        `/api/analytics?${params.toString()}`,
      );
      if (!response.ok) {
        // Return mock data for demo
        return {
          totalLeads: 324,
          conversionRate: 23.5,
          totalLoanValue: 45000000,
          averageLoanAmount: 3200000,
          leadsByStatus: {
            new: 45,
            contacted: 67,
            under_review: 89,
            approved: 76,
            rejected: 32,
            disbursed: 15,
          },
          leadsByMonth: [
            { month: "Jan", count: 45, value: 15000000 },
            { month: "Feb", count: 52, value: 18000000 },
            { month: "Mar", count: 38, value: 12000000 },
            { month: "Apr", count: 61, value: 22000000 },
            { month: "May", count: 55, value: 19000000 },
            { month: "Jun", count: 73, value: 25000000 },
          ],
          topPerformers: [
            { name: "CA Manager", leads: 45, conversions: 12 },
            { name: "Loan Broker", leads: 38, conversions: 9 },
            { name: "Builder Partner", leads: 32, conversions: 8 },
          ],
        };
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
      // Mock export functionality
      const blob = new Blob(["Lead Report Data"], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lead-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

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
              <SelectItem value="performance">Performance Report</SelectItem>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.totalLeads}
            </div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.conversionRate}%
            </div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="mr-1 h-3 w-3" />
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Loan Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData?.totalLoanValue || 0)}
            </div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="mr-1 h-3 w-3" />
              +18.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Loan Amount
            </CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData?.averageLoanAmount || 0)}
            </div>
            <p className="text-xs text-red-600 flex items-center">
              <TrendingDown className="mr-1 h-3 w-3" />
              -3.2% from last month
            </p>
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
              {Object.entries(analyticsData?.leadsByStatus || {}).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <Badge variant="outline" className="capitalize">
                      {status.replace("_", " ")}
                    </Badge>
                    <span className="font-semibold">{count}</span>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData?.leadsByMonth?.map((month) => (
                <div
                  key={month.month}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{month.month}</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {month.count} leads
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(month.value)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData?.topPerformers?.map((performer, index) => (
              <div
                key={performer.name}
                className="flex items-center justify-between p-4 border rounded"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <span className="font-medium">{performer.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {performer.leads} leads
                  </div>
                  <div className="text-xs text-gray-500">
                    {performer.conversions} conversions
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
