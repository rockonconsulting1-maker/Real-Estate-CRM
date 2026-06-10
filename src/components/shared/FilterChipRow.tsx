import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface FilterChip {
  id: string;
  label: string;
}

interface FilterChipRowProps {
  chips: FilterChip[];
  selectedIds?: string[];
  onChange: (selectedIds: string[]) => void;
  className?: string;
}

export function FilterChipRow({ chips, selectedIds = [], onChange, className }: FilterChipRowProps) {
  const toggleChip = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const clearAll = () => onChange([]);

  return (
    <ScrollArea className={cn("w-full whitespace-nowrap", className)}>
      <div className="flex w-max space-x-2 p-1 items-center">
        {selectedIds.length > 0 && (
          <button 
            onClick={clearAll}
            className="text-xs font-medium text-accent-brand flex items-center gap-1 px-2 hover:underline"
          >
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
        {chips.map((chip) => {
          const isActive = selectedIds.includes(chip.id);
          return (
            <Badge
              key={chip.id}
              variant={isActive ? "default" : "outline"}
              className={cn(
                "cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-accent-brand text-white hover:bg-accent-brand/90 border-transparent" 
                  : "bg-background text-foreground-2 hover:bg-background-sunk border-border"
              )}
              onClick={() => toggleChip(chip.id)}
            >
              {chip.label}
            </Badge>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  );
}
