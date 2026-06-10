import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { ghlProxy } from "@/lib/ghlProxy";

// Mock types for now until we define them fully in types/index.ts
export interface DashboardSummary {
  activeLeads: number;
  activeDeals: number;
  pipelineValue: number;
  closedMtd: number;
  gciProgress: number;
  overdueTasks: number;
  newLeads: any[];
  pendingOffers: any[];
  activity: any[];
  pipelineData: any[];
}

export function useDashboard() {
  return useQuery({
    queryKey: qk.dashboard.summary,
    queryFn: async (): Promise<DashboardSummary> => {
      // In a real implementation, this would aggregate data from:
      // /contacts/search, /opportunities/search, /calendars/events, etc.
      // For now, we return mock data to build the UI.
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      return {
        activeLeads: 24,
        activeDeals: 12,
        pipelineValue: 4250000,
        closedMtd: 2,
        gciProgress: 65,
        overdueTasks: 3,
        newLeads: [
          { id: "1", name: "Sarah Jenkins", time: "2h ago", role: "Buyer" },
          { id: "2", name: "Mike Ross", time: "4h ago", role: "Seller" },
          { id: "3", name: "Elena Gilbert", time: "1d ago", role: "Both" },
        ],
        pendingOffers: [
          { id: "1", property: "123 Main St", amount: 450000, status: "Pending" },
          { id: "2", property: "456 Oak Ave", amount: 825000, status: "Counter" },
        ],
        activity: [
          { id: "1", title: "Called Sarah Jenkins", time: "10:30 AM", description: "Discussed pre-approval." },
          { id: "2", title: "Offer submitted", time: "Yesterday", description: "123 Main St for $450k" },
        ],
        pipelineData: [
          { name: "Hot", value: 400 },
          { name: "Warm", value: 300 },
          { name: "Cold", value: 300 },
        ]
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}
