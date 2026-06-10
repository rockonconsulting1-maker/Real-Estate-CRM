import { useParams } from "react-router-dom";
import { useOffer, useUpdateOfferStatus } from "@/hooks/useOffers";
import { PageHeader } from "@/components/layout/PageHeader";
import { DetailTabs } from "@/components/shared/DetailTabs";
import { OfferKeyGrid } from "@/components/offers/OfferKeyGrid";
import { NegotiationTimeline } from "@/components/offers/NegotiationTimeline";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  CheckCircle, 
  XCircle, 
  Share2, 
  Plus, 
  MoreHorizontal,
  Info,
  CheckSquare,
  Calendar as CalendarIcon,
  MessageSquare,
  Files,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/EmptyState";
import { MasterDetailLayout } from "@/components/shared/MasterDetailLayout";
import { money } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function OfferDetail() {
  const { recordId } = useParams();
  const isMobile = useIsMobile();
  const { data: offer, isLoading } = useOffer(recordId);
  const { mutate: updateStatus } = useUpdateOfferStatus();

  if (isLoading) {
    return <div className="p-8 animate-pulse space-y-4">
      <div className="h-10 w-1/3 bg-muted rounded" />
      <div className="h-64 bg-muted rounded" />
    </div>;
  }

  if (!offer) {
    return <EmptyState icon={AlertCircle} title="Offer Not Found" description="The requested offer could not be located." />;
  }

  const statusActions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={isMobile ? "icon" : "default"} className="gap-2">
          {!isMobile && "Update Status"}
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => updateStatus({ id: offer.id, status: "negotiating" })}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Mark Negotiating
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateStatus({ id: offer.id, status: "accepted" })} className="text-success focus:text-success">
          <CheckCircle className="w-4 h-4 mr-2" />
          Accept Offer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateStatus({ id: offer.id, status: "rejected" })} className="text-destructive focus:text-destructive">
          <XCircle className="w-4 h-4 mr-2" />
          Reject Offer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => updateStatus({ id: offer.id, status: "expired" })}>
          Expired
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size={isMobile ? "icon" : "default"} className="gap-2">
        <Share2 className="w-4 h-4" />
        {!isMobile && "Share PDF"}
      </Button>
      {statusActions}
    </div>
  );

  const detailsContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Financials</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border">
              <div className="text-xs text-muted-foreground mb-1">Purchase Price</div>
              <div className="text-xl font-bold text-primary">{money(offer.purchase_price)}</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border">
              <div className="text-xs text-muted-foreground mb-1">Deposit</div>
              <div className="text-lg font-semibold">{money(offer.deposit_amount)}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Key Dates</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border">
              <div className="text-xs text-muted-foreground mb-1">Closing Date</div>
              <div className="text-sm font-medium">
                {offer.closing_date ? format(new Date(offer.closing_date), "MMM d, yyyy") : "-"}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border">
              <div className="text-xs text-muted-foreground mb-1">Possession</div>
              <div className="text-sm font-medium">
                {offer.possession_date ? format(new Date(offer.possession_date), "MMM d, yyyy") : "On Closing"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Associations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-card border flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Property</div>
              <div className="text-sm font-medium truncate max-w-[150px]">{offer.property_address}</div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-card border flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Buyer</div>
              <div className="text-sm font-medium">{offer.buyer_name}</div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-card border flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Seller</div>
              <div className="text-sm font-medium">{offer.seller_name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { value: "details", label: "Details", content: detailsContent },
    { value: "tasks", label: "Tasks", content: <EmptyState icon={CheckSquare} title="No Tasks" description="No tasks linked to this offer." /> },
    { value: "notes", label: "Notes", content: <EmptyState icon={MessageSquare} title="No Notes" description="No notes linked to this offer." /> },
    { value: "appointments", label: "Appointments", content: <EmptyState icon={CalendarIcon} title="No Appointments" description="No appointments linked to this offer." /> },
    { value: "documents", label: "Documents", content: <EmptyState icon={Files} title="No Documents" description="No documents linked to this offer." /> },
    { value: "opportunity", label: "Opportunity", content: <EmptyState icon={TrendingUp} title="No Opportunity" description="No opportunity linked to this offer." /> },
  ];

  return (
    <div className="flex flex-col gap-6 pb-32 md:pb-8">
      <PageHeader 
        title={money(offer.purchase_price)} 
        description={offer.property_address}
        action={!isMobile ? headerActions : undefined}
      />
      
      <div className="mt-2 flex items-center gap-3">
        <Badge variant="outline" className="capitalize px-3 py-1">
          {offer.status.replace("_", " ")}
        </Badge>
        {offer.expiry_date && (
          <span className="text-xs text-muted-foreground">
            Expires {format(new Date(offer.expiry_date), "MMM d, h:mm a")}
          </span>
        )}
      </div>

      {isMobile ? (
        <div className="space-y-6">
          <OfferKeyGrid offer={offer} />
          <DetailTabs tabs={tabs} defaultValue="details" />
          <StickyActionBar>
            <Button variant="ghost" className="flex flex-col h-auto py-2 gap-1" onClick={() => {}}>
              <Share2 className="w-5 h-5" />
              <span className="text-[10px]">Share PDF</span>
            </Button>
            <Button variant="ghost" className="flex flex-col h-auto py-2 gap-1" onClick={() => {}}>
              <MessageSquare className="w-5 h-5" />
              <span className="text-[10px]">Log Event</span>
            </Button>
            <Button variant="ghost" className="flex flex-col h-auto py-2 gap-1" onClick={() => {}}>
              <Plus className="w-5 h-5" />
              <span className="text-[10px]">Add Task</span>
            </Button>
            <Button variant="ghost" className="flex flex-col h-auto py-2 gap-1" onClick={() => {}}>
              <TrendingUp className="w-5 h-5" />
              <span className="text-[10px]">Status</span>
            </Button>
          </StickyActionBar>
        </div>
      ) : (
        <MasterDetailLayout
          master={<DetailTabs tabs={tabs} defaultValue="details" className="p-6" />}
          detail={
            <div className="p-6 sticky top-0">
              <NegotiationTimeline offer={offer} />
            </div>
          }
        />
      )}
    </div>
  );
}
