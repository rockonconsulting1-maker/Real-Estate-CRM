import { ReactNode } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface KanbanColumn {
  id: string;
  title: string;
  count?: number;
  items: ReactNode[];
  headerExtra?: ReactNode;
}

interface KanbanProps {
  columns: KanbanColumn[];
  className?: string;
}

export function Kanban({ columns, className }: KanbanProps) {
  return (
    <ScrollArea className={cn("h-full w-full", className)}>
      <div className="flex h-full p-4 space-x-4 w-max">
        {columns.map(col => (
          <div key={col.id} className="flex flex-col w-[300px] flex-shrink-0 bg-background-sunk rounded-lg border border-border">
            <div className="p-3 border-b border-border flex flex-col bg-background/50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{col.title}</h3>
                {col.count !== undefined && (
                  <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">
                    {col.count}
                  </span>
                )}
              </div>
              {col.headerExtra && col.headerExtra}
            </div>
            <ScrollArea className="flex-1 p-3">
              {col.items}
            </ScrollArea>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
