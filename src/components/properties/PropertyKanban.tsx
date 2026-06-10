import { Property } from "@/types";
import { Kanban, KanbanColumn } from "@/components/shared/Kanban";
import { PropertyCard } from "./PropertyCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { money } from "@/lib/format";

interface PropertyKanbanProps {
  properties: Property[];
  isLoading?: boolean;
}

const STAGES = [
  { id: "coming_soon", name: "Coming Soon", color: "var(--info)" },
  { id: "active", name: "Active Listing", color: "var(--success)" },
  { id: "under_contract", name: "Under Contract", color: "var(--warning)" },
  { id: "sold", name: "Sold/Off Market", color: "var(--foreground-4)" },
];

export function PropertyKanban({ properties, isLoading }: PropertyKanbanProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const columns: KanbanColumn[] = STAGES.map(stage => {
    const stageProps = properties.filter(p => p.status === stage.id);
    const moneySum = stageProps.reduce((sum, p) => sum + (p.price || 0), 0);
    
    return {
      id: stage.id,
      title: stage.name,
      count: stageProps.length,
      headerExtra: (
        <div className="text-xs font-medium text-muted-foreground mt-1">
          {money(moneySum)}
        </div>
      ),
      items: stageProps.map(p => (
        <PropertyCard 
          key={p.id}
          property={p} 
          onClick={() => navigate(`/properties/${p.id}`)}
          className="mb-3"
        />
      ))
    };
  });

  return (
    <Kanban 
      columns={columns}
      className="flex-1"
    />
  );
}

