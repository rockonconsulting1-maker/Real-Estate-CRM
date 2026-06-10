import { useParams } from "react-router-dom";
import { useProperty } from "@/hooks/useProperties";
import { PageHeader } from "@/components/layout/PageHeader";
import { MasterDetailLayout } from "@/components/shared/MasterDetailLayout";
import { DetailTabs } from "@/components/shared/DetailTabs";
import { PropertyHeroCarousel } from "@/components/properties/PropertyHeroCarousel";
import { PropertyOverviewTabs } from "@/components/properties/PropertyOverviewTabs";
import { OfferComparisonTable } from "@/components/properties/OfferComparisonTable";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Building2, Share, CalendarPlus, FileText, MessageSquare, Phone, Mail } from "lucide-react";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { Button } from "@/components/ui/button";

export default function PropertyDetail() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { data: property, isLoading } = useProperty(propertyId);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <SkeletonLoader variant="card" />
        <SkeletonLoader variant="list-row" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6">
        <EmptyState 
          icon={Building2} 
          title="Property Not Found" 
          description="The property you are looking for does not exist or you don't have access." 
        />
      </div>
    );
  }

  const tabs = [
    {
      value: "overview",
      label: "Overview",
      content: <PropertyOverviewTabs property={property} />
    },
    {
      value: "contacts",
      label: "Contacts",
      content: <EmptyState icon={Building2} title="No Contacts" description="No contacts associated with this property yet." />
    },
    {
      value: "tasks",
      label: "Tasks",
      content: <EmptyState icon={FileText} title="No Tasks" description="No tasks for this property yet." />
    },
    {
      value: "notes",
      label: "Notes",
      content: <EmptyState icon={MessageSquare} title="No Notes" description="No notes for this property yet." />
    },
    {
      value: "appointments",
      label: "Appointments",
      content: <EmptyState icon={CalendarPlus} title="No Appointments" description="No appointments scheduled." />
    },
    {
      value: "opportunities",
      label: "Opportunities",
      content: <EmptyState icon={Building2} title="No Opportunities" description="No opportunities linked." />
    },
    {
      value: "offers",
      label: "Offers",
      content: <OfferComparisonTable offers={[]} /> // Mock empty offers for now
    }
  ];

  return (
    <div className="flex flex-col h-full bg-background relative pb-16 md:pb-0">
      <PageHeader 
        title={property.address} 
      />

      <MasterDetailLayout
        master={
          <div className="flex flex-col h-full overflow-y-auto border-r">
            <PropertyHeroCarousel property={property} />
            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-lg">Key Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Status</div>
                  <div className="font-medium capitalize">{property.status.replace("_", " ")}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">MLS #</div>
                  <div className="font-medium">{property.mls}</div>
                </div>
              </div>
            </div>
          </div>
        }
        detail={
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/10">
            <DetailTabs tabs={tabs} defaultValue="overview" />
          </div>
        }
      />

      <StickyActionBar>
        <div className="flex items-center justify-around w-full">
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2">
            <Phone className="h-5 w-5 mb-1" />
            <span className="text-[10px]">Call</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2">
            <MessageSquare className="h-5 w-5 mb-1" />
            <span className="text-[10px]">Text</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2">
            <Mail className="h-5 w-5 mb-1" />
            <span className="text-[10px]">Email</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2">
            <CalendarPlus className="h-5 w-5 mb-1" />
            <span className="text-[10px]">Showing</span>
          </Button>
        </div>
      </StickyActionBar>
    </div>
  );
}

