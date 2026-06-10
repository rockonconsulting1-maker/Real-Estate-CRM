import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Building2, User, Activity } from "lucide-react";

export type OfferGroupType = "property" | "client" | "status";

interface OfferGroupByToggleProps {
  value: OfferGroupType;
  onValueChange: (value: OfferGroupType) => void;
}

export function OfferGroupByToggle({ value, onValueChange }: OfferGroupByToggleProps) {
  return (
    <ToggleGroup 
      type="single" 
      value={value} 
      onValueChange={(v) => v && onValueChange(v as OfferGroupType)}
      className="justify-start border rounded-md p-1 bg-muted/50"
    >
      <ToggleGroupItem value="property" className="gap-2 px-3 h-8 text-xs">
        <Building2 className="w-3.5 h-3.5" />
        Property
      </ToggleGroupItem>
      <ToggleGroupItem value="client" className="gap-2 px-3 h-8 text-xs">
        <User className="w-3.5 h-3.5" />
        Client
      </ToggleGroupItem>
      <ToggleGroupItem value="status" className="gap-2 px-3 h-8 text-xs">
        <Activity className="w-3.5 h-3.5" />
        Status
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
