import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Home } from "lucide-react";

interface PipelineToggleProps {
  value: 'lsNchTsvghJQKPBYCS9Z' | 'F5uB4bZnB0M8YgJ86sLg';
  onValueChange: (value: 'lsNchTsvghJQKPBYCS9Z' | 'F5uB4bZnB0M8YgJ86sLg') => void;
  className?: string;
}

export function PipelineToggle({ value, onValueChange, className }: PipelineToggleProps) {
  return (
    <Tabs 
      value={value} 
      onValueChange={(v) => onValueChange(v as any)} 
      className={className}
    >
      <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
        <TabsTrigger value="lsNchTsvghJQKPBYCS9Z" className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <span>Buyer</span>
        </TabsTrigger>
        <TabsTrigger value="F5uB4bZnB0M8YgJ86sLg" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          <span>Seller</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
