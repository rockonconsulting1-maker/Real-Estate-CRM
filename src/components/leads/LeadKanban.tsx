import { Lead } from "@/hooks/useLeads";
import { Kanban, KanbanColumn } from "@/components/shared/Kanban";
import { LeadCard } from "./LeadCard";
import { useUpdateOpportunityStage } from "@/hooks/useLeads";
import { StageDot } from "@/components/shared/StageDot";
import { Money } from "@/components/shared/Money";
import { usePipelines } from "@/providers/PipelineConfigProvider";

interface LeadKanbanProps {
  leads: Lead[];
}

export function LeadKanban({ leads }: LeadKanbanProps) {
  const { leadPipeline } = usePipelines();
  const { mutate: updateStage } = useUpdateOpportunityStage();

  if (!leadPipeline) return null;

  const columns: KanbanColumn[] = leadPipeline.stages.map((stage, index) => {
    const stageLeads = leads.filter(l => 
      l.opportunity?.pipelineStageId === stage.id || (!l.opportunity && index === 0)
    );

    const totalValue = stageLeads.reduce((sum, l) => sum + (l.opportunity?.monetaryValue || 0), 0);

    return {
      id: stage.id,
      title: stage.name,
      count: stageLeads.length,
      headerExtra: (
        <div className="flex items-center gap-2 mt-1">
          <StageDot color="hsl(var(--primary))" />
          <Money amount={totalValue} className="text-xs text-muted-foreground" />
        </div>
      ),
      items: stageLeads.map(lead => (
        <LeadCard key={lead.id} lead={lead} className="mb-3" />
      ))
    };
  });

  return (
    <Kanban 
      columns={columns} 
      className="h-[calc(100vh-12rem)]" 
    />
  );
}
