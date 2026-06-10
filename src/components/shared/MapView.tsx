import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface MapViewProps {
  address?: string;
  className?: string;
}

export function MapView({ address, className }: MapViewProps) {
  return (
    <div className={cn("relative w-full h-[300px] bg-background-sunk rounded-lg border border-border overflow-hidden flex items-center justify-center", className)}>
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: "radial-gradient(circle at center, hsl(var(--border)) 1px, transparent 1px)",
        backgroundSize: "20px 20px"
      }} />
      <div className="z-10 flex flex-col items-center text-muted-foreground">
        <MapPin className="h-8 w-8 mb-2 text-primary mx-auto" />
        <p className="text-sm font-medium text-foreground">{address || "Location Map"}</p>
        <p className="text-xs">Interactive map placeholder</p>
      </div>
    </div>
  );
}
