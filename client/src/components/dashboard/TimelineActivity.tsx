import { Plus, Check, FileText, Phone } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ActivityItem {
  id: string;
  type: "lead_assigned" | "lead_approved" | "document_uploaded" | "call_scheduled";
  title: string;
  description: string;
  time: string;
}

interface TimelineActivityProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
}

const activityIcons = {
  lead_assigned: { icon: Plus, color: "bg-cred-mint text-cred-dark" },
  lead_approved: { icon: Check, color: "bg-green-100 text-green-600" },
  document_uploaded: { icon: FileText, color: "bg-blue-100 text-blue-600" },
  call_scheduled: { icon: Phone, color: "bg-cred-orange/10 text-cred-orange" },
};

export function TimelineActivity({ activities = [], isLoading }: TimelineActivityProps) {
  // Mock data for demonstration
  const defaultActivities: ActivityItem[] = [
    {
      id: "1",
      type: "lead_assigned",
      title: "New lead assigned to Sarah Wilson",
      description: "Rahul Patel - Home Loan ₹45L",
      time: "2 minutes ago",
    },
    {
      id: "2", 
      type: "lead_approved",
      title: "Loan approved for Anjali Modi",
      description: "LAP - ₹25,00,000",
      time: "1 hour ago",
    },
    {
      id: "3",
      type: "document_uploaded", 
      title: "Documents uploaded",
      description: "Priya Sharma - Income proof",
      time: "3 hours ago",
    },
    {
      id: "4",
      type: "call_scheduled",
      title: "Follow-up call scheduled",
      description: "Vikram Shah - Tomorrow 2 PM",
      time: "5 hours ago",
    },
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-6">
          <h3 className="text-lg font-semibold text-cred-dark">Recent Activity</h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-48 h-4 bg-gray-200 rounded"></div>
                  <div className="w-32 h-3 bg-gray-200 rounded"></div>
                  <div className="w-20 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-6">
        <h3 className="text-lg font-semibold text-cred-dark">Recent Activity</h3>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {displayActivities.map((activity) => {
            const { icon: Icon, color } = activityIcons[activity.type];
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
