import { useState } from "react";
import { useProperties } from "@/hooks/useProperties";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, List, Kanban as KanbanIcon, Map as MapIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PropertyKanban } from "@/components/properties/PropertyKanban";
import { PropertyMapView } from "@/components/properties/PropertyMapView";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { RecordList } from "@/components/shared/RecordList";
import { AddPropertyModal } from "@/components/properties/AddPropertyModal";
import { FilterChipRow } from "@/components/shared/FilterChipRow";
import { useNavigate } from "react-router-dom";

export default function Properties() {
  const [view, setView] = useState<"list" | "kanban" | "map">("kanban");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: properties = [], isLoading } = useProperties();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Properties"
        action={
          <div className="flex items-center gap-2">
            <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as any)} className="hidden sm:flex">
              <ToggleGroupItem value="list" aria-label="List View"><List className="w-4 h-4" /></ToggleGroupItem>
              <ToggleGroupItem value="kanban" aria-label="Kanban View"><KanbanIcon className="w-4 h-4" /></ToggleGroupItem>
              <ToggleGroupItem value="map" aria-label="Map View"><MapIcon className="w-4 h-4" /></ToggleGroupItem>
            </ToggleGroup>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Property
            </Button>
          </div>
        }
      />

      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden gap-4">
        {/* Mobile View Toggle */}
        <div className="sm:hidden">
          <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as any)} className="justify-start">
            <ToggleGroupItem value="list" aria-label="List View"><List className="w-4 h-4" /></ToggleGroupItem>
            <ToggleGroupItem value="kanban" aria-label="Kanban View"><KanbanIcon className="w-4 h-4" /></ToggleGroupItem>
            <ToggleGroupItem value="map" aria-label="Map View"><MapIcon className="w-4 h-4" /></ToggleGroupItem>
          </ToggleGroup>
        </div>

        <FilterChipRow 
          chips={[
            { id: "all", label: "All Properties" },
            { id: "coming_soon", label: "Coming Soon" },
            { id: "active", label: "Active" },
            { id: "under_contract", label: "Under Contract" },
            { id: "sold", label: "Sold" },
          ]}
          selectedIds={["all"]}
          onChange={() => {}}
        />

        <div className="flex-1 min-h-0">
          {view === "kanban" && (
            <PropertyKanban properties={properties} isLoading={isLoading} />
          )}
          {view === "map" && (
            <PropertyMapView properties={properties} />
          )}
          {view === "list" && (
            <RecordList 
              items={properties}
              renderItem={(p) => (
                <PropertyCard 
                  property={p} 
                  onClick={() => navigate(`/properties/${p.id}`)}
                />
              )}
              isLoading={isLoading}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            />
          )}
        </div>
      </div>

      <AddPropertyModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen} 
      />
    </div>
  );
}
