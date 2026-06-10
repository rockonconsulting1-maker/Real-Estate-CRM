import { Property } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertySpecsGrid } from "./PropertySpecsGrid";

interface PropertyOverviewTabsProps {
  property: Property;
}

export function PropertyOverviewTabs({ property }: PropertyOverviewTabsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Beautiful property located at {property.address}. This {property.beds} bedroom, {property.baths} bathroom home offers {property.sqft} sqft of living space. 
            Currently listed for {property.price ? `$${property.price.toLocaleString()}` : 'TBD'}.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <PropertySpecsGrid property={property} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["Hardwood Floors", "Central Air", "2-Car Garage", "Finished Basement", "Fenced Yard"].map((feature) => (
              <span key={feature} className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground border">
                {feature}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
