import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SkeletonLoader } from "./SkeletonLoader";
import { EmptyState } from "./EmptyState";
import { Search } from "lucide-react";

interface RecordListProps<T> {
  items: T[];
  isLoading?: boolean;
  renderItem: (item: T) => ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function RecordList<T extends { id: string }>({ 
  items, 
  isLoading, 
  renderItem, 
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search or filters.",
  className 
}: RecordListProps<T>) {
  if (isLoading) {
    return (
      <div className={cn("p-4 space-y-4", className)}>
        {[1, 2, 3, 4, 5].map(i => <SkeletonLoader key={i} variant="list-row" />)}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn("p-4", className)}>
        <EmptyState 
          icon={<Search className="h-6 w-6" />}
          title={emptyTitle}
          description={emptyDescription}
        />
      </div>
    );
  }

  return (
    <ScrollArea className={cn("h-full w-full", className)}>
      <div className="flex flex-col">
        {items.map((item) => (
          <div 
            key={item.id}
            className="border-b border-border last:border-0"
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
