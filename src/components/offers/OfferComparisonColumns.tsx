import { Offer } from "@/types";
import { money } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface OfferComparisonColumnsProps {
  offers: Offer[];
}

export function OfferComparisonColumns({ offers }: OfferComparisonColumnsProps) {
  if (!offers?.length) return null;

  const rows = [
    { label: "Purchase Price", getValue: (o: Offer) => money(o.purchase_price), highlight: true },
    { label: "Deposit", getValue: (o: Offer) => money(o.deposit_amount) },
    { label: "Closing Date", getValue: (o: Offer) => o.closing_date ? format(new Date(o.closing_date), "MMM d, yyyy") : "-" },
    { label: "Expiry", getValue: (o: Offer) => o.expiry_date ? format(new Date(o.expiry_date), "MMM d, yyyy") : "-" },
    { label: "Buyer", getValue: (o: Offer) => o.buyer_name },
    { label: "Seller", getValue: (o: Offer) => o.seller_name },
    { 
      label: "Status", 
      getValue: (o: Offer) => (
        <Badge variant="outline" className="capitalize">
          {o.status.replace("_", " ")}
        </Badge>
      ) 
    },
  ];

  return (
    <ScrollArea className="w-full pb-4">
      <div className="flex gap-4 min-w-max p-1">
        {offers.map((offer, idx) => (
          <Card key={offer.id} className="w-72 shrink-0">
            <CardHeader className="py-4 border-b bg-muted/30">
              <CardTitle className="text-sm font-medium text-center">Offer {idx + 1}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {rows.map((row, rowIdx) => (
                <div 
                  key={rowIdx} 
                  className={cn(
                    "flex flex-col p-4 border-b last:border-b-0",
                    rowIdx % 2 === 0 ? "bg-background" : "bg-muted/10"
                  )}
                >
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    {row.label}
                  </span>
                  <div className={cn(
                    "text-sm font-medium",
                    row.highlight ? "text-primary font-bold text-base" : ""
                  )}>
                    {row.getValue(offer)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
