import { Property } from "@/types";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { PropertyCard } from "./PropertyCard";
import { useNavigate } from "react-router-dom";

interface PropertyMapViewProps {
  properties: Property[];
  className?: string;
}

export function PropertyMapView({ properties, className }: PropertyMapViewProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const navigate = useNavigate();

  return (
    <div className={cn("relative w-full h-full min-h-[500px] bg-background-sunk rounded-lg border border-border overflow-hidden flex items-center justify-center", className)}>
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: "radial-gradient(circle at center, hsl(var(--border)) 1px, transparent 1px)",
        backgroundSize: "20px 20px"
      }} />
      
      {/* Simulated Map Content */}
      <div className="absolute inset-0 z-10 p-8">
        <div className="w-full h-full relative">
          {properties.map((property, idx) => {
            // Randomly position pins for the placeholder
            const top = `${20 + (idx * 37) % 60}%`;
            const left = `${20 + (idx * 43) % 60}%`;
            const isSelected = selectedProperty?.id === property.id;
            
            return (
              <div 
                key={property.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ top, left }}
              >
                <button
                  onClick={() => setSelectedProperty(property)}
                  className={cn(
                    "relative group flex items-center justify-center w-8 h-8 rounded-full transition-transform hover:scale-110",
                    isSelected ? "z-20 scale-110" : "z-10"
                  )}
                >
                  <MapPin className={cn(
                    "w-6 h-6",
                    isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  )} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini-card overlay */}
      {selectedProperty && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-sm px-4">
          <div className="relative">
            <button 
              className="absolute -top-3 -right-3 z-40 w-8 h-8 bg-background border rounded-full flex items-center justify-center shadow-md hover:bg-muted"
              onClick={() => setSelectedProperty(null)}
            >
              &times;
            </button>
            <PropertyCard 
              property={selectedProperty} 
              onClick={() => navigate(`/properties/${selectedProperty.id}`)}
              className="shadow-2"
            />
          </div>
        </div>
      )}
      
      {!selectedProperty && (
        <div className="absolute bottom-6 right-6 z-10 bg-background/80 backdrop-blur-sm border rounded-md px-3 py-2 text-xs text-muted-foreground shadow-sm">
          Interactive Map Placeholder
        </div>
      )}
    </div>
  );
}
