import { useParams, useNavigate } from "react-router-dom";
import { useClient } from "@/hooks/useClients";
import { PageHeader } from "@/components/layout/PageHeader";
import { ClientProgressBar } from "@/components/clients/ClientProgressBar";
import { ClientBuyerPanel } from "@/components/clients/ClientBuyerPanel";
import { ClientSellerPanel } from "@/components/clients/ClientSellerPanel";
import { DetailTabs } from "@/components/shared/DetailTabs";
import { MasterDetailLayout } from "@/components/shared/MasterDetailLayout";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { Phone, MessageSquare, FilePlus, CalendarPlus, FileIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ActivityTimeline } from "@/components/shared/ActivityTimeline";
import { cn } from "@/lib/utils";

export default function ClientDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const isIsMobile = useIsMobile();
  const { data: client, isLoading } = useClient(clientId!);

  if (isLoading) return <SkeletonLoader variant="card" className="m-6" />;
  if (!client) {
    return (
      <EmptyState 
        icon={<Search className="h-6 w-6" />}
        title="Client not found" 
        description="The client you're looking for doesn't exist." 
        action={<Button onClick={() => navigate('/clients')}>Back to Clients</Button>} 
      />
    );
  }

  const isBuyer = client.opportunity?.pipelineId === 'lsNchTsvghJQKPBYCS9Z';
  const isSeller = client.opportunity?.pipelineId === 'F5uB4bZnB0M8YgJ86sLg';
  const isBoth = isBuyer && isSeller;

  const steps = [
    { id: '1', label: 'Consultation', status: 'complete' as const },
    { id: '2', label: 'Showing', status: 'complete' as const },
    { id: '3', label: 'Offer', status: 'current' as const },
    { id: '4', label: 'Contract', status: 'upcoming' as const },
    { id: '5', label: 'Closing', status: 'upcoming' as const },
  ];

  const detailContent = (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="p-4 border-b border-border-2 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <ClientProgressBar steps={steps} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className={cn(
          "grid gap-6",
          !isIsMobile && isBoth ? "grid-cols-2" : "grid-cols-1"
        )}>
          {(isBuyer || isBoth) && <ClientBuyerPanel />}
          {(isSeller || isBoth) && <ClientSellerPanel />}
        </div>

        <DetailTabs 
          tabs={[
            { value: 'opportunities', label: 'Opportunities', content: <div className="p-4 text-muted-foreground">No other active opportunities</div> },
            { value: 'tasks', label: 'Tasks', content: <div className="p-4 text-muted-foreground">No pending tasks</div> },
            { value: 'notes', label: 'Notes', content: <div className="p-4 text-muted-foreground">No recent notes</div> },
            { value: 'appointments', label: 'Appointments', content: <div className="p-4 text-muted-foreground">No upcoming appointments</div> },
            { value: 'documents', label: 'Documents', content: <EmptyState icon={<FileIcon className="h-6 w-6" />} title="No documents" description="Upload contracts, disclosures, and other files here." /> },
          ]}
        />
      </div>

      {isIsMobile && (
        <StickyActionBar>
          <Button variant="ghost" size="icon" onClick={() => {}}>
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => {}}>
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => {}}>
            <FilePlus className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => {}}>
            <CalendarPlus className="h-5 w-5" />
          </Button>
        </StickyActionBar>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader 
        title={`${client.firstName} ${client.lastName}`}
        action={
          <div className="flex items-center gap-2">
            {!isIsMobile && (
              <>
                <Button variant="outline" size="sm" className="gap-2">
                  <Phone className="h-4 w-4" />
                  <span>Call</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Text</span>
                </Button>
              </>
            )}
            <Button size="sm">Edit Client</Button>
          </div>
        }
      />

      <MasterDetailLayout
        master={
          <div className="p-4 space-y-6">
            <div className="flex flex-col items-center text-center py-6 border-b border-border-2">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-3xl font-bold mb-4">
                {client.firstName[0]}{client.lastName[0]}
              </div>
              <h2 className="text-xl font-bold">{client.firstName} {client.lastName}</h2>
              <p className="text-sm text-muted-foreground">{client.email}</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-foreground-4 uppercase tracking-wider">Activity Feed</h3>
              <ActivityTimeline items={[]} />
            </div>
          </div>
        }
        detail={detailContent}
        isDetailOpen={true}
        className="flex-1 overflow-hidden"
      />
    </div>
  );
}


