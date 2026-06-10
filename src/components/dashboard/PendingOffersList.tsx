import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Money } from "@/components/shared/Money";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PendingOffersListProps {
  offers: any[];
  className?: string;
}

export function PendingOffersList({ offers, className }: PendingOffersListProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Pending Offers</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {offers.length === 0 ? (
          <div className="text-sm text-muted-foreground">No pending offers.</div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{offer.property}</span>
                  <Money amount={offer.amount} className="text-sm text-muted-foreground" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {offer.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
