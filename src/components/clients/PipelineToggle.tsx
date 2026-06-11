import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Home } from "lucide-react";
import { usePipelines } from "@/providers/PipelineConfigProvider";

interface PipelineToggleProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function PipelineToggle({ value, onValueChange, className }: PipelineToggleProps) {
  const { buyerPipeline, sellerPipeline } = usePipelines();

  return (
    <Tabs 
      value={value} 
      onValueChange={(v) => onValueChange(v as any)} 
      className={className}
    >
      <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
        <TabsTrigger value={buyerPipeline?.id || 'buyer'} className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <span>Buyer</span>
        </TabsTrigger>
        <TabsTrigger value={sellerPipeline?.id || 'seller'} className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          <span>Seller</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
