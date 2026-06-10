import { Property } from "@/types";

export function PropertySpecsGrid({ property }: { property: Property }) {
  const specs = [
    { label: "Property Type", value: "Single Family" },
    { label: "Year Built", value: "2015" },
    { label: "Lot Size", value: "0.25 Acres" },
    { label: "Heating", value: "Forced Air" },
    { label: "Cooling", value: "Central" },
    { label: "Parking", value: "Attached Garage" },
    { label: "HOA", value: "$50/month" },
    { label: "Taxes", value: "$4,200/year" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {specs.map((spec, index) => (
        <div key={index} className="space-y-1">
          <div className="text-xs text-muted-foreground">{spec.label}</div>
          <div className="text-sm font-medium">{spec.value}</div>
        </div>
      ))}
    </div>
  );
}
