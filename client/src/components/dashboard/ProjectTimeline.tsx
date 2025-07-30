import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  Clock, 
  Building2, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  MapPin,
  DollarSign,
  Users,
  TrendingUp
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProjectsResponse, LeadsResponse, Project, Lead } from "@/types/api";

export function ProjectTimeline() {
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch projects for timeline
  const { data: projects = { projects: [], total: 0 } } = useQuery<ProjectsResponse>({
    queryKey: ["/api/projects"],
    refetchInterval: 30000,
  });

  // Fetch leads associated with projects
  const { data: leads = { leads: [], total: 0 } } = useQuery<LeadsResponse>({
    queryKey: ["/api/leads"],
    refetchInterval: 30000,
  });

  // Generate timeline events from projects and leads
  const generateTimelineEvents = () => {
    const events: any[] = [];

    // Add project events
    projects.projects.forEach((project: Project) => {
      events.push({
        id: `project-${project.id}`,
        type: "project",
        title: `Project: ${project.name}`,
        description: `${project.type} project in ${project.location}`,
        date: project.createdAt,
        status: project.status,
        icon: Building2,
        data: project,
      });

      if (project.completionDate) {
        events.push({
          id: `completion-${project.id}`,
          type: "milestone",
          title: `${project.name} Completion`,
          description: `Expected completion date`,
          date: project.completionDate,
          status: "upcoming",
          icon: CheckCircle,
          data: project,
        });
      }
    });

    // Add lead events
    leads.leads.forEach((lead: Lead) => {
      events.push({
        id: `lead-${lead.id}`,
        type: "lead",
        title: `New Lead: ${lead.firstName} ${lead.lastName}`,
        description: `${lead.loanType} - ₹${lead.loanAmount?.toLocaleString()}`,
        date: lead.createdAt,
        status: lead.status,
        icon: Users,
        data: lead,
      });
    });

    // Sort by date (newest first)
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const timelineEvents = generateTimelineEvents();

  const filteredEvents = timelineEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedProject === "all") return matchesSearch;
    
    return matchesSearch && event.data.id === parseInt(selectedProject);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
      case "new":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "construction":
      case "contacted":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "ready":
      case "approved":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "sold":
      case "disbursed":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getEventIcon = (type: string, status: string) => {
    switch (type) {
      case "project":
        return Building2;
      case "milestone":
        return status === "completed" ? CheckCircle : Calendar;
      case "lead":
        return Users;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Project Timeline</h2>
          <p className="text-gray-300">Track all project and lead activities</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Input
            placeholder="Search timeline..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/10 border-white/20 text-white"
          />
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white min-w-[150px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.projects.map((project: any) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard gradient="neutral" blur="md" className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{projects.projects.length}</p>
              <p className="text-xs text-gray-400">Total Projects</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard gradient="neutral" blur="md" className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                {projects.projects.filter((p: any) => p.status === "ready").length}
              </p>
              <p className="text-xs text-gray-400">Completed</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard gradient="neutral" blur="md" className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                {projects.projects.filter((p: any) => p.status === "construction").length}
              </p>
              <p className="text-xs text-gray-400">In Progress</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard gradient="neutral" blur="md" className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{leads.leads.length}</p>
              <p className="text-xs text-gray-400">Total Leads</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Timeline */}
      <GlassCard gradient="neutral" blur="md" className="p-6">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No timeline events found</p>
            <p className="text-sm text-gray-500">Create projects or add leads to see activity</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEvents.map((event, index) => {
              const Icon = getEventIcon(event.type, event.status);
              
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="relative flex items-start space-x-4"
                >
                  {/* Timeline Line */}
                  {index < filteredEvents.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-gradient-to-b from-white/20 to-transparent" />
                  )}
                  
                  {/* Icon */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center border border-white/20">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white">{event.title}</h3>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3">{event.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          
                          {event.type === "project" && (
                            <>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{event.data.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-3 w-3" />
                                <span>₹{event.data.expectedRevenue?.toLocaleString()}</span>
                              </div>
                            </>
                          )}
                          
                          {event.type === "lead" && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-3 w-3" />
                              <span>₹{event.data.loanAmount?.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-white hover:bg-white/10"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}