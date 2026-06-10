import { Offer } from "@/types";
import { money } from "@/lib/format";
import { CountdownBadge } from "@/components/shared/CountdownBadge";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

interface OfferKeyGridProps {
  offer: Offer;
}

export function OfferKeyGrid({ offer }: OfferKeyGridProps) {
  const items = [
    { label: "Purchase Price", value: money(offer.purchase_price), highlight: true },
    { label: "Deposit", value: money(offer.deposit_amount) },
    { 
      label: "Expiry", 
      value: offer.expiry_date ? <CountdownBadge date={offer.expiry_date} /> : "No Expiry" 
    },
    { 
      label: "Closing Date", 
      value: offer.closing_date ? format(new Date(offer.closing_date), "MMM d, yyyy") : "-" 
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, idx) => (
        <Card key={idx} className="bg-card border-none shadow-sm">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              {item.label}
            </span>
            <div className={`text-lg font-bold ${item.highlight ? 'text-primary' : ''}`}>
              {item.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
