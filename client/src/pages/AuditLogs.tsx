import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, Download, Eye } from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { Main } from "@/components/ui/layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import AuditLogs from "@/pages/AuditLogs";
import { AuditLog } from "@/lib/types";
import { authenticatedFetch } from "@/lib/auth";
import { useRoleAccess } from "@/hooks/useRoleAccess";

export default function AuditLogs() {
  const [currentPage, setCurrentPage] = useState(1);
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("all");
  const { canViewAuditLogs } = useRoleAccess();

  // Redirect if no permission
  if (!canViewAuditLogs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to view audit logs.</p>
        </div>
      </div>
    );
  }

  // Fetch audit logs
  const { data: auditData, isLoading } = useQuery<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }>({
    queryKey: ["/api/audit-logs", { page: currentPage, resourceType: resourceTypeFilter }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "25",
      });
      
      if (resourceTypeFilter !== "all") {
        params.append("resourceType", resourceTypeFilter);
      }

      const response = await authenticatedFetch(`/api/audit-logs?${params}`);
      return response.json();
    },
  });

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-800";
      case "update":
        return "bg-blue-100 text-blue-800";
      case "delete":
        return "bg-red-100 text-red-800";
      case "login":
        return "bg-purple-100 text-purple-800";
      case "logout":
        return "bg-gray-100 text-gray-800";
      case "assign":
        return "bg-orange-100 text-orange-800";
      case "status_change":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const handleExport = () => {
    // Implement export functionality
    console.log("Export audit logs");
  };

  return (
    <>
      <Header
        title="Audit Logs"
        subtitle="Track all system activities and user actions for compliance and security."
      />

      <Main>
        <Card>
          <CardHeader className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-cred-dark">System Audit Logs</h3>
                <p className="text-sm text-gray-600">
                  {auditData?.total || 0} total audit entries
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Resource Type Filter */}
                <Select 
                  value={resourceTypeFilter} 
                  onValueChange={setResourceTypeFilter}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Resources</SelectItem>
                    <SelectItem value="user">Users</SelectItem>
                    <SelectItem value="lead">Leads</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline"
                  onClick={handleExport}
                  className="border-gray-300"
                >
                  <Download size={16} className="mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8">
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border-b border-gray-100">
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="w-64 h-4 bg-gray-200 rounded"></div>
                        <div className="w-48 h-3 bg-gray-200 rounded"></div>
                      </div>
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !auditData?.logs.length ? (
              <div className="p-12 text-center">
                <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
                <p className="text-gray-500">
                  {resourceTypeFilter !== "all" 
                    ? "No activities found for the selected resource type." 
                    : "System activities will appear here."
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {auditData.logs.map((log) => {
                  const dateTime = formatDateTime(log.createdAt);
                  
                  return (
                    <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge className={`${getActionBadgeColor(log.action)} text-xs font-medium`}>
                              {log.action.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-medium text-cred-dark">
                              {log.resourceType.charAt(0).toUpperCase() + log.resourceType.slice(1)}
                              {log.resourceId && ` #${log.resourceId}`}
                            </span>
                          </div>

                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">User ID {log.userId}</span> performed{" "}
                            <span className="font-medium">{log.action}</span> action on{" "}
                            <span className="font-medium">{log.resourceType}</span>
                            {log.resourceId && (
                              <span> with ID <span className="font-medium">{log.resourceId}</span></span>
                            )}
                          </div>

                          {(log.oldValues || log.newValues) && (
                            <div className="mt-3 text-xs">
                              {log.oldValues && (
                                <div className="mb-1">
                                  <span className="font-medium text-gray-500">Previous:</span>{" "}
                                  <code className="bg-gray-100 px-2 py-1 rounded text-gray-700">
                                    {JSON.stringify(log.oldValues)}
                                  </code>
                                </div>
                              )}
                              {log.newValues && (
                                <div>
                                  <span className="font-medium text-gray-500">New:</span>{" "}
                                  <code className="bg-gray-100 px-2 py-1 rounded text-gray-700">
                                    {JSON.stringify(log.newValues)}
                                  </code>
                                </div>
                              )}
                            </div>
                          )}

                          {log.ipAddress && (
                            <div className="mt-2 text-xs text-gray-500">
                              IP: {log.ipAddress}
                            </div>
                          )}
                        </div>

                        <div className="text-right text-sm text-gray-500 ml-4">
                          <div className="font-medium">{dateTime.date}</div>
                          <div>{dateTime.time}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {auditData && auditData.total > 25 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * 25) + 1} to {Math.min(currentPage * 25, auditData.total)} of {auditData.total} results
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage * 25 >= auditData.total}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  );
}
