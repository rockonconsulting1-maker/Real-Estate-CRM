import { PageHeader } from "@/components/layout/PageHeader";
import { PipelineToggle } from "@/components/clients/PipelineToggle";
import { ClientKanban } from "@/components/clients/ClientKanban";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, Table as TableIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterChipRow } from "@/components/shared/FilterChipRow";
import { SavedViewDropdown } from "@/components/shared/SavedViewDropdown";
import { RecordList } from "@/components/shared/RecordList";
import { ClientCard } from "@/components/clients/ClientCard";
import { useClients } from "@/hooks/useClients";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoadMoreButton } from "@/components/shared/LoadMoreButton";

type ViewMode = 'kanban' | 'table';
type PipelineId = 'lsNchTsvghJQKPBYCS9Z' | 'F5uB4bZnB0M8YgJ86sLg';

export default function Clients() {
  const isIsMobile = useIsMobile();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>(isIsMobile ? 'kanban' : 'kanban');
  const [pipelineId, setPipelineId] = useState<PipelineId>('lsNchTsvghJQKPBYCS9Z');
  
  const {
    data: clients,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useClients({ pipelineId });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader 
        title="Clients" 
        action={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Client</span>
          </Button>
        }
      />

      <div className="flex flex-col gap-4 p-4 md:p-6 overflow-hidden flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PipelineToggle 
            value={pipelineId} 
            onValueChange={setPipelineId} 
          />
          
          <div className="flex items-center gap-2">
            <SavedViewDropdown scope="clients" />
            {!isIsMobile && (
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="kanban" className="gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    <span>Kanban</span>
                  </TabsTrigger>
                  <TabsTrigger value="table" className="gap-2">
                    <TableIcon className="h-4 w-4" />
                    <span>Table</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
        </div>

        <FilterChipRow 
          chips={[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'pending', label: 'Pending' },
            { id: 'closed', label: 'Closed' },
          ]}
          selectedIds={['all']}
          onChange={() => {}}
        />

        <div className="flex-1 overflow-hidden">
          {viewMode === 'kanban' ? (
            <ClientKanban pipelineId={pipelineId} />
          ) : (
            <>
              <RecordList
                items={clients || []}
                isLoading={isLoading}
                renderItem={(client) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    onClick={() => navigate(`/clients/${client.id}`)}
                  />
                )}
                emptyTitle="No clients found"
                emptyDescription="Try adjusting your filters or add a new client."
              />
              <LoadMoreButton
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );}
