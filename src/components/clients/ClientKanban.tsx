import { useClients } from "@/hooks/useClients";
import { Kanban } from "@/components/shared/Kanban";
import { ClientCard } from "./ClientCard";
import { useUpdateOpportunityStage } from "@/hooks/useLeads";
import { useNavigate } from "react-router-dom";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { usePipelines } from "@/providers/PipelineConfigProvider";

interface ClientKanbanProps {
  pipelineId: string;
}

export function ClientKanban({ pipelineId }: ClientKanbanProps) {
  const navigate = useNavigate();
  const { data: clients, isLoading } = useClients({ pipelineId });
  const { mutate: updateStage } = useUpdateOpportunityStage();
  const { buyerPipeline, sellerPipeline } = usePipelines();

  const currentPipeline = pipelineId === buyerPipeline?.id ? buyerPipeline : (pipelineId === sellerPipeline?.id ? sellerPipeline : null);

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

  if (!currentPipeline) return null;

  const columns = currentPipeline.stages.map(stage => ({
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
