import { Offer } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CountdownBadge } from "@/components/shared/CountdownBadge";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";

interface OfferCardProps {
  offer: Offer;
  onClick?: () => void;
  className?: string;
}

export function OfferCard({ offer, onClick, className }: OfferCardProps) {
  const buyerInitials = offer.buyer_name?.split(" ").map(n => n[0]).join("") || "B";
  const sellerInitials = offer.seller_name?.split(" ").map(n => n[0]).join("") || "S";

  return (
    <Card 
      className={cn("overflow-hidden cursor-pointer hover:border-primary/50 transition-colors", className)}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold text-lg">{money(offer.purchase_price)}</div>
            <div className="text-sm text-muted-foreground line-clamp-1">{offer.property_address}</div>
          </div>
          <Badge variant="outline" className="capitalize">
            {offer.status.replace("_", " ")}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            <Avatar className="w-8 h-8 border-2 border-background" title={`Buyer: ${offer.buyer_name}`}>
              <AvatarFallback className="text-[10px]">{buyerInitials}</AvatarFallback>
            </Avatar>
            <Avatar className="w-8 h-8 border-2 border-background" title={`Seller: ${offer.seller_name}`}>
              <AvatarFallback className="text-[10px] bg-muted">{sellerInitials}</AvatarFallback>
            </Avatar>
          </div>
          {offer.expiry_date && (
            <CountdownBadge date={offer.expiry_date} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
