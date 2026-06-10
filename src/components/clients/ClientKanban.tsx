import { Client, useClients } from "@/hooks/useClients";
import { Kanban } from "@/components/shared/Kanban";
import { ClientCard } from "./ClientCard";
import { useUpdateOpportunityStage } from "@/hooks/useLeads";
import { useNavigate } from "react-router-dom";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";

interface ClientKanbanProps {
  pipelineId: 'lsNchTsvghJQKPBYCS9Z' | 'F5uB4bZnB0M8YgJ86sLg';
}

export function ClientKanban({ pipelineId }: ClientKanbanProps) {
  const navigate = useNavigate();
  const { data: clients, isLoading } = useClients({ pipelineId });
  const { mutate: updateStage } = useUpdateOpportunityStage();

  // Mock stages based on typical real estate pipelines if not provided by API
  // In a real app, these would be fetched from GHL
  const buyerStages = [
    { id: 'b1', name: 'Showing' },
    { id: 'b2', name: 'Offer Made' },
    { id: 'b3', name: 'Negotiation' },
    { id: 'b4', name: 'Under Contract' },
    { id: 'b5', name: 'Inspection' },
    { id: 'b6', name: 'Appraisal' },
    { id: 'b7', name: 'Financing' },
    { id: 'b8', name: 'Clear to Close' },
    { id: 'b9', name: 'Closed' },
    { id: 'b10', name: 'Post-Closing' },
  ];

  const sellerStages = [
    { id: 's1', name: 'Pre-Listing' },
    { id: 's2', name: 'Active Listing' },
    { id: 's3', name: 'Offer Received' },
    { id: 's4', name: 'Negotiation' },
    { id: 's5', name: 'Under Contract' },
    { id: 's6', name: 'Inspection/Due Diligence' },
    { id: 's7', name: 'Appraisal' },
    { id: 's8', name: 'Clear to Close' },
    { id: 's9', name: 'Closed' },
  ];

  const stages = pipelineId === 'lsNchTsvghJQKPBYCS9Z' ? buyerStages : sellerStages;

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="w-[300px] shrink-0">
            <SkeletonLoader variant="kanban-column" />
          </div>
        ))}
      </div>
    );
  }

  const columns = stages.map(stage => ({
    id: stage.id,
    title: stage.name,
    count: clients?.filter(c => c.opportunity?.pipelineStageId === stage.id).length || 0,
    items: (clients || [])
      .filter(c => c.opportunity?.pipelineStageId === stage.id)
      .map(client => (
        <ClientCard 
          key={client.id}
          client={client} 
          onClick={() => navigate(`/clients/${client.id}`)}
          className="mb-3"
        />
      ))
  }));

  return (
    <Kanban
      columns={columns}
    />
  );
}
