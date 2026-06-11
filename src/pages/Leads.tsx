import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { UserSquare2, LayoutList, LayoutGrid } from "lucide-react";
import { useLeads, LeadFilters } from "@/hooks/useLeads";
import { LeadCard } from "@/components/leads/LeadCard";
import { LeadKanban } from "@/components/leads/LeadKanban";
import { FilterChipRow } from "@/components/shared/FilterChipRow";
import { SavedViewDropdown } from "@/components/shared/SavedViewDropdown";
import { RecordList } from "@/components/shared/RecordList";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContextFAB } from "@/components/layout/ContextFAB";
import { AddLeadDrawer } from "@/components/shared/forms/AddLeadDrawer";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { LoadMoreButton } from "@/components/shared/LoadMoreButton";

const ROLE_FILTERS = [
  { id: "Hot", label: "Hot" },
  { id: "Warm", label: "Warm" },
  { id: "Cold", label: "Cold" },
  { id: "Buyer", label: "Buyer" },
  { id: "Seller", label: "Seller" },
  { id: "Both", label: "Both" },
  { id: "Investor", label: "Investor" },
  { id: "Renter", label: "Renter" },
];

export default function Leads() {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [filters, setFilters] = useState<LeadFilters>({});
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const {
    data: leads,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useLeads(filters);

  const handleFilterChange = (selectedIds: string[]) => {
    setSelectedFilters(selectedIds);
    // Basic filter mapping for demo
    const newFilters: LeadFilters = {};
    if (selectedIds.includes("Hot")) newFilters.status = "Hot";
    // ... more mapping
    setFilters(newFilters);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <PageHeader 
        title="Leads" 
        description="Manage your prospective clients."
        action={
          <div className="flex items-center gap-2">
            <Tabs value={view} onValueChange={(v) => setView(v as any)} className="hidden md:flex">
              <TabsList>
                <TabsTrigger value="list"><LayoutList className="h-4 w-4 mr-2" /> List</TabsTrigger>
                <TabsTrigger value="kanban"><LayoutGrid className="h-4 w-4 mr-2" /> Kanban</TabsTrigger>
              </TabsList>
            </Tabs>
            <SavedViewDropdown scope="leads" />
          </div>
        }
      />

      <div className="px-4 md:px-0">
        <FilterChipRow 
          chips={ROLE_FILTERS} 
          selectedIds={selectedFilters}
          onChange={handleFilterChange}
        />
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="space-y-4 p-4">
            {view === "list" ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonLoader key={i} variant="list-row" />
              ))
            ) : (
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonLoader key={i} variant="kanban-column" className="w-[300px] shrink-0" />
                ))}
              </div>
            )}
          </div>
        ) : leads && leads.length > 0 ? (
          view === "list" ? (
            <>
              <RecordList
                items={leads}
                renderItem={(lead) => <LeadCard lead={lead} />}
              />
              <LoadMoreButton
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              />
            </>
          ) : (
            <LeadKanban leads={leads} />
          )
        ) : (
          <EmptyState 
            icon={UserSquare2} 
            title="No leads found" 
            description="Try adjusting your filters or add a new lead." 
            action={
              <Button onClick={() => setIsAddDrawerOpen(true)}>
                Add Lead
              </Button>
            }
          />
        )}
      </div>

      <ContextFAB 
        onClick={() => setIsAddDrawerOpen(true)} 
      />

      <AddLeadDrawer 
        open={isAddDrawerOpen} 
        onOpenChange={setIsAddDrawerOpen} 
      />
    </div>
  );
}
