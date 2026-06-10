import { Offer } from "@/types";
import { money } from "@/lib/format";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface OfferComparisonTableProps {
  offers: Offer[];
}

export function OfferComparisonTable({ offers }: OfferComparisonTableProps) {
  if (!offers?.length) {
    return (
      <div className="py-8 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
        No offers available for comparison.
      </div>
    );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="flex w-max min-w-full">
        {/* Sticky Headers */}
        <div className="sticky left-0 z-20 w-40 bg-muted/80 backdrop-blur-md border-r font-medium text-sm">
          <div className="h-14 border-b flex items-center px-4 bg-muted text-muted-foreground">Offer Details</div>
          <div className="h-12 border-b flex items-center px-4">Price</div>
          <div className="h-12 border-b flex items-center px-4">Deposit</div>
          <div className="h-12 border-b flex items-center px-4">Closing Date</div>
          <div className="h-12 border-b flex items-center px-4">Expiry</div>
          <div className="h-12 flex items-center px-4">Status</div>
        </div>

        {/* Data Columns */}
        {offers.map((offer, idx) => (
          <div key={offer.id} className="w-48 border-r last:border-r-0 text-sm flex-shrink-0 bg-background">
            <div className="h-14 border-b flex items-center justify-center px-4 font-medium bg-muted/30">
              Offer {idx + 1}
            </div>
            <div className="h-12 border-b flex items-center justify-center px-4 font-semibold text-primary">
              {money(offer.purchase_price)}
            </div>
            <div className="h-12 border-b flex items-center justify-center px-4">
              {money(offer.deposit_amount)}
            </div>
            <div className="h-12 border-b flex items-center justify-center px-4">
              {offer.closing_date ? format(new Date(offer.closing_date), "MMM d, yyyy") : "-"}
            </div>
            <div className="h-12 border-b flex items-center justify-center px-4 text-muted-foreground">
              {offer.expiry_date ? format(new Date(offer.expiry_date), "MMM d, yyyy") : "-"}
            </div>
            <div className="h-12 flex items-center justify-center px-4">
              <Badge variant="outline" className="capitalize">
                {offer.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
