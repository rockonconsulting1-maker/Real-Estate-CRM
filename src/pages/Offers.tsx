import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useOffers } from "@/hooks/useOffers";
import { OfferGroupByToggle, OfferGroupType } from "@/components/offers/OfferGroupByToggle";
import { OfferAccordionGroup } from "@/components/offers/OfferAccordionGroup";
import { OfferTable } from "@/components/offers/OfferTable";
import { OfferComparisonColumns } from "@/components/offers/OfferComparisonColumns";
import { AddOfferDrawer } from "@/components/offers/AddOfferDrawer";
import { OfferCard } from "@/components/offers/OfferCard";
import { Button } from "@/components/ui/button";
import { Plus, Table as TableIcon, LayoutGrid, ArrowLeftRight, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContextFAB } from "@/components/layout/ContextFAB";
import { LoadMoreButton } from "@/components/shared/LoadMoreButton";

export default function Offers() {
  const isMobile = useIsMobile();
  const [groupBy, setGroupBy] = useState<OfferGroupType>("property");
  const [view, setView] = useState<"accordion" | "table">(isMobile ? "accordion" : "table");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  const {
    data: offers = [],
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useOffers();

  // Grouping logic
  const groups = Array.from(new Set(offers.map(o => {
    if (groupBy === "property") return o.property_address || "Unknown Property";
    if (groupBy === "client") return o.buyer_name || "Unknown Client";
    return o.status;
  }))).map(groupName => ({
    id: groupName,
    name: groupName.replace("_", " ").toUpperCase(),
    offers: offers.filter(o => {
      if (groupBy === "property") return o.property_address === groupName || (!o.property_address && groupName === "Unknown Property");
      if (groupBy === "client") return o.buyer_name === groupName || (!o.buyer_name && groupName === "Unknown Client");
      return o.status === groupName;
    })
  }));

  const activeOffers = offers.filter(o => o.status === "negotiating" || o.status === "draft");
  const selectedOffers = offers.filter(o => selectedIds.includes(o.id));

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-8">
      <PageHeader 
        title="Offers" 
        description="Manage negotiations and contracts."
        action={
          !isMobile && (
            <Button onClick={() => setIsAddDrawerOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              New Offer
            </Button>
          )
        }
      />

      {isComparing ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Comparing {selectedIds.length} Offers</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsComparing(false)} className="gap-2">
              <X className="w-4 h-4" />
              Close Comparison
            </Button>
          </div>
          <OfferComparisonColumns offers={selectedOffers} />
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <OfferGroupByToggle value={groupBy} onValueChange={setGroupBy} />
              {!isMobile && (
                <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-[200px]">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="accordion" className="gap-2">
                      <LayoutGrid className="w-3.5 h-3.5" />
                      Groups
                    </TabsTrigger>
                    <TabsTrigger value="table" className="gap-2">
                      <TableIcon className="w-3.5 h-3.5" />
                      Table
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>

            {selectedIds.length > 1 && (
              <Button 
                variant="outline" 
                className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
                onClick={() => setIsComparing(true)}
              >
                <ArrowLeftRight className="w-4 h-4" />
                Compare {selectedIds.length} Offers
              </Button>
            )}
          </div>

          {activeOffers.length > 0 && groupBy !== "status" && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Active Negotiations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeOffers.slice(0, 3).map(offer => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            </div>
          )}

          {view === "accordion" || isMobile ? (
            <OfferAccordionGroup groups={groups} isLoading={isLoading} />
          ) : (
            <OfferTable
              offers={offers}
              selectedIds={selectedIds}
              onSelectChange={setSelectedIds}
              isLoading={isLoading}
            />
          )}

          <LoadMoreButton
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          />
        </>
      )}

      {isMobile && <ContextFAB onClick={() => setIsAddDrawerOpen(true)} />}
      
      <AddOfferDrawer 
        open={isAddDrawerOpen} 
        onOpenChange={setIsAddDrawerOpen} 
      />
    </div>
  );
}
