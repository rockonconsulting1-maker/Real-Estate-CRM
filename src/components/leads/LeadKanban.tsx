import { Lead } from "@/hooks/useLeads";
import { Kanban, KanbanColumn } from "@/components/shared/Kanban";
import { LeadCard } from "./LeadCard";
import { useUpdateOpportunityStage } from "@/hooks/useLeads";
import { StageDot } from "@/components/shared/StageDot";
import { Money } from "@/components/shared/Money";

interface LeadKanbanProps {
  leads: Lead[];
}

const LEAD_STAGES = [
  { id: "new_lead", title: "New Lead", color: "hsl(var(--info))" },
  { id: "attempted_contact", title: "Attempted Contact", color: "hsl(var(--warning))" },
  { id: "contacted", title: "Contacted", color: "hsl(var(--success))" },
  { id: "appointment_set", title: "Appointment Set", color: "hsl(var(--accent-brand))" },
  { id: "appointment_met", title: "Appointment Met", color: "hsl(var(--primary))" },
  { id: "nurture", title: "Nurture", color: "hsl(var(--foreground-2))" },
  { id: "dead", title: "Dead", color: "hsl(var(--destructive))" },
];

export function LeadKanban({ leads }: LeadKanbanProps) {
  const { mutate: updateStage } = useUpdateOpportunityStage();

  const columns: KanbanColumn[] = LEAD_STAGES.map(stage => {
    const stageLeads = leads.filter(l => 
      l.opportunity?.pipelineStageId === stage.id || (!l.opportunity && stage.id === "new_lead")
    );

    const totalValue = stageLeads.reduce((sum, l) => sum + (l.opportunity?.monetaryValue || 0), 0);

    return {
      id: stage.id,
      title: stage.title,
      count: stageLeads.length,
      headerExtra: (
        <div className="flex items-center gap-2 mt-1">
          <StageDot color={stage.color} />
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
