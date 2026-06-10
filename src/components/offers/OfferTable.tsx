import { Offer } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CountdownBadge } from "@/components/shared/CountdownBadge";
import { money } from "@/lib/format";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

interface OfferTableProps {
  offers: Offer[];
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  isLoading?: boolean;
}

export function OfferTable({ offers, selectedIds, onSelectChange, isLoading }: OfferTableProps) {
  const navigate = useNavigate();

  const toggleAll = () => {
    if (selectedIds.length === offers.length) {
      onSelectChange([]);
    } else {
      onSelectChange(offers.map(o => o.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  if (isLoading) {
    return <div className="space-y-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-12 w-full bg-muted animate-pulse rounded-md" />
      ))}
    </div>;
  }

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-12">
              <Checkbox 
                checked={selectedIds.length === offers.length && offers.length > 0}
                onCheckedChange={toggleAll}
              />
            </TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Deposit</TableHead>
            <TableHead>Expiry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Activity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.map((offer) => (
            <TableRow 
              key={offer.id} 
              className="cursor-pointer hover:bg-muted/30"
              onClick={() => navigate(`/offers/${offer.id}`)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox 
                  checked={selectedIds.includes(offer.id)}
                  onCheckedChange={() => toggleOne(offer.id)}
                />
              </TableCell>
              <TableCell className="font-medium max-w-[200px] truncate">
                {offer.property_address}
              </TableCell>
              <TableCell>{offer.buyer_name}</TableCell>
              <TableCell className="font-semibold text-primary">{money(offer.purchase_price)}</TableCell>
              <TableCell>{money(offer.deposit_amount)}</TableCell>
              <TableCell>
                {offer.expiry_date && <CountdownBadge date={offer.expiry_date} />}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {offer.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {offer.updated_at ? format(new Date(offer.updated_at), "MMM d, h:mm a") : "-"}
              </TableCell>
            </TableRow>
          ))}
          {offers.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                No offers found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
