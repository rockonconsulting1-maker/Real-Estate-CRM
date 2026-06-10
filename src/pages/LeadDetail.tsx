import { useState } from "react";
import { useParams } from "react-router-dom";
import { useLead } from "@/hooks/useLeads";
import { LeadDetailHeader } from "@/components/leads/LeadDetailHeader";
import { DetailTabs } from "@/components/shared/DetailTabs";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { Phone, MessageSquare, Plus, UserCheck } from "lucide-react";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { EmptyState } from "@/components/shared/EmptyState";
import { UserSquare2 } from "lucide-react";
import { ConvertToClientModal } from "@/components/shared/forms/ConvertToClientModal";
import { ActivityTimeline } from "@/components/shared/ActivityTimeline";
import { MasterDetailLayout } from "@/components/shared/MasterDetailLayout";
import { Button } from "@/components/ui/button";

export default function LeadDetail() {
  const { leadId } = useParams<{ leadId: string }>();
  const { data: lead, isLoading, error } = useLead(leadId!);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <SkeletonLoader variant="card" className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <SkeletonLoader variant="card" className="h-64" />
          </div>
          <div className="space-y-6">
            <SkeletonLoader variant="card" className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState 
          icon={UserSquare2} 
          title="Lead not found" 
          description="The lead you are looking for does not exist or has been removed." 
        />
      </div>
    );
  }

  const tabs = [
    { value: "details", label: "Details", content: (
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Contact Info</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{lead.email || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{lead.phone || "—"}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Pipeline Info</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stage</span>
                <span className="font-medium">{lead.opportunity?.pipelineStageId || "New Lead"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Value</span>
                <span className="font-medium">${lead.opportunity?.monetaryValue?.toLocaleString() || "0"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )},
    { value: "tasks", label: "Tasks", content: <div className="p-8 text-center text-muted-foreground">No tasks for this lead.</div> },
    { value: "notes", label: "Notes", content: <div className="p-8 text-center text-muted-foreground">No notes for this lead.</div> },
    { value: "appointments", label: "Appointments", content: <div className="p-8 text-center text-muted-foreground">No appointments scheduled.</div> },
    { value: "opportunities", label: "Opportunities", content: <div className="p-8 text-center text-muted-foreground">No other opportunities.</div> },
    { value: "properties", label: "Properties", content: <div className="p-8 text-center text-muted-foreground">No associated properties.</div> },
    { value: "offers", label: "Offers", content: <div className="p-8 text-center text-muted-foreground">No offers made.</div> },
  ];

  return (
    <div className="flex flex-col h-full">
      <LeadDetailHeader lead={lead} />
      
      <div className="flex-1 overflow-hidden">
        <div className="md:hidden">
          <DetailTabs tabs={tabs} defaultValue="details" />
        </div>

        <div className="hidden md:block h-full">
          <MasterDetailLayout
            master={
              <div className="p-6 space-y-8">
                <section>
                  <h3 className="text-lg font-semibold mb-4">Lead Progress</h3>
                  <div className="bg-background-sunk rounded-lg p-4 border border-border">
                    {/* Progress visual placeholder */}
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-accent-brand w-1/4" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Stage: {lead.opportunity?.pipelineStageId || "New Lead"}</p>
                  </div>
                </section>

                <DetailTabs tabs={tabs} defaultValue="details" />
              </div>
            }
            detail={
              <div className="p-6 border-l border-border h-full bg-background/50">
                <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
                <ActivityTimeline 
                  items={[]} 
                  className="bg-transparent border-0 shadow-none"
                />
              </div>
            }
          />
        </div>
      </div>

      <StickyActionBar>
        <div className="flex flex-col items-center gap-1" onClick={() => {}}>
          <Phone className="h-5 w-5" />
          <span className="text-[10px]">Call</span>
        </div>
        <div className="flex flex-col items-center gap-1" onClick={() => {}}>
          <MessageSquare className="h-5 w-5" />
          <span className="text-[10px]">Text</span>
        </div>
        <div className="flex flex-col items-center gap-1" onClick={() => {}}>
          <Plus className="h-5 w-5" />
          <span className="text-[10px]">Note</span>
        </div>
        <div className="flex flex-col items-center gap-1" onClick={() => setIsConvertModalOpen(true)}>
          <UserCheck className="h-5 w-5" />
          <span className="text-[10px]">Convert</span>
        </div>
      </StickyActionBar>

      <ConvertToClientModal 
        open={isConvertModalOpen} 
        onOpenChange={setIsConvertModalOpen} 
        leadId={lead.id} 
      />
    </div>
  );
}
