import { Plus, Users, Download, Settings } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onAddLead?: () => void;
  onAssignLeads?: () => void;
  onExportReports?: () => void;
  onWorkflowSettings?: () => void;
}

export function QuickActions({
  onAddLead,
  onAssignLeads,
  onExportReports,
  onWorkflowSettings,
}: QuickActionsProps) {
  return (
    <Card>
      <CardHeader className="p-6">
        <h3 className="text-lg font-semibold text-cred-dark">Quick Actions</h3>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          <Button 
            className="w-full bg-cred-mint text-cred-dark hover:bg-cred-mint/90"
            onClick={onAddLead}
          >
            <Plus size={16} className="mr-2" />
            Add New Lead
          </Button>
          
          <Button 
            className="w-full bg-cred-orange text-white hover:bg-cred-orange/90"
            onClick={onAssignLeads}
          >
            <Users size={16} className="mr-2" />
            Assign Leads
          </Button>
          
          <Button 
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-50"
            onClick={onExportReports}
          >
            <Download size={16} className="mr-2" />
            Export Reports
          </Button>

          <Button 
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-50"
            onClick={onWorkflowSettings}
          >
            <Settings size={16} className="mr-2" />
            Workflow Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
