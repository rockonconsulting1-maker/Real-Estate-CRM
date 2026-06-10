import { Property } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square } from "lucide-react";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
  className?: string;
}

export function PropertyCard({ property, onClick, className }: PropertyCardProps) {
  return (
    <Card 
      className={cn("overflow-hidden cursor-pointer hover:border-primary/50 transition-colors", className)}
      onClick={onClick}
    >
      <div className="aspect-[4/3] bg-muted relative">
        {property.images?.[0] ? (
          <img 
            src={property.images[0]} 
            alt={property.address} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full image-placeholder">No Image</div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            {property.status}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="font-semibold text-lg mb-1">{money(property.price)}</div>
        <div className="text-sm text-muted-foreground flex items-start gap-1 mb-3">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="line-clamp-1">{property.address}</span>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
          {property.beds !== undefined && (
            <div className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" />
              <span>{property.beds}</span>
            </div>
          )}
          {property.baths !== undefined && (
            <div className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" />
              <span>{property.baths}</span>
            </div>
          )}
          {property.sqft !== undefined && (
            <div className="flex items-center gap-1">
              <Square className="w-3.5 h-3.5" />
              <span>{property.sqft}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
