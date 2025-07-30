import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, Settings, CheckCircle, Clock, AlertCircle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authenticatedFetch } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface CrmIntegration {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
  lastSyncAt?: string;
  config: Record<string, any>;
}

export function CRMIntegrationStatus() {
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: '',
    config: {}
  });
  const { toast } = useToast();

  const { data: integrations = [], isLoading, refetch } = useQuery<CrmIntegration[]>({
    queryKey: ["/api/crm-integrations"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/crm-integrations");
      if (!response.ok) {
        return [];
      }
      const result = await response.json();
      return Array.isArray(result) ? result : [];
    },
  });

  const getStatusIcon = (integration: CrmIntegration) => {
    if (!integration.isActive) {
      return <AlertCircle className="text-red-500" size={16} />;
    }
    if (integration.lastSyncAt) {
      return <CheckCircle className="text-green-500" size={16} />;
    }
    return <Clock className="text-yellow-500" size={16} />;
  };

  const getStatusText = (integration: CrmIntegration) => {
    if (!integration.isActive) return "Disconnected";
    if (integration.lastSyncAt) return "Connected";
    return "Pending";
  };

  const getStatusColor = (integration: CrmIntegration) => {
    if (!integration.isActive) return "bg-red-100 text-red-800";
    if (integration.lastSyncAt) return "bg-green-100 text-green-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const handleToggleIntegration = async (id: number, isActive: boolean) => {
    try {
      await authenticatedFetch(`/api/crm-integrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      toast({
        title: "Integration updated",
        description: `Integration ${!isActive ? 'enabled' : 'disabled'} successfully.`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update integration",
        variant: "destructive",
      });
    }
  };

  const handleAddIntegration = async () => {
    try {
      await authenticatedFetch("/api/crm-integrations", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIntegration),
      });
      toast({
        title: "Integration added",
        description: "New CRM integration has been configured.",
      });
      setIsAddModalOpen(false);
      setNewIntegration({ name: '', type: '', config: {} });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add integration",
        variant: "destructive",
      });
    }
  };

  const defaultIntegrations = [
    { name: "Salesforce", type: "salesforce", status: "Connected" },
    { name: "HubSpot", type: "hubspot", status: "Synced" },
    { name: "Zoho CRM", type: "zoho", status: "Pending" },
  ];

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Link size={20} />
              CRM Integration
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsManageModalOpen(true)}
            >
              <Settings size={16} className="mr-2" />
              Manage Integrations
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Default integrations display */}
              {defaultIntegrations.map((integration, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    {integration.status === "Connected" && <CheckCircle className="text-green-500" size={16} />}
                    {integration.status === "Synced" && <CheckCircle className="text-green-500" size={16} />}
                    {integration.status === "Pending" && <Clock className="text-yellow-500" size={16} />}
                    <span className="font-medium">{integration.name}</span>
                  </div>
                  <Badge 
                    className={
                      integration.status === "Connected" || integration.status === "Synced"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {integration.status}
                  </Badge>
                </div>
              ))}

              {/* Dynamic integrations */}
              {Array.isArray(integrations) && integrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(integration)}
                    <span className="font-medium">{integration.name}</span>
                  </div>
                  <Badge className={getStatusColor(integration)}>
                    {getStatusText(integration)}
                  </Badge>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      {/* Manage Integrations Modal */}
      <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage CRM Integrations</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Active Integrations</h3>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus size={16} className="mr-2" />
                Add Integration
              </Button>
            </div>
            <div className="space-y-3">
              {integrations?.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(integration)}
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-sm text-gray-500">{integration.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(integration)}>
                      {getStatusText(integration)}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleIntegration(integration.id, integration.isActive)}
                    >
                      {integration.isActive ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Integration Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Integration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Integration Name</Label>
              <Input
                id="name"
                value={newIntegration.name}
                onChange={(e) => setNewIntegration({...newIntegration, name: e.target.value})}
                placeholder="e.g., My Salesforce"
              />
            </div>
            <div>
              <Label htmlFor="type">CRM Type</Label>
              <Select value={newIntegration.type} onValueChange={(value) => setNewIntegration({...newIntegration, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select CRM type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salesforce">Salesforce</SelectItem>
                  <SelectItem value="hubspot">HubSpot</SelectItem>
                  <SelectItem value="zoho">Zoho CRM</SelectItem>
                  <SelectItem value="pipedrive">Pipedrive</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddIntegration}>
                Add Integration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}