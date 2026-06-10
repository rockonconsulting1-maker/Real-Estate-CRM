import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  time: string;
  icon?: ReactNode;
}

interface ActivityTimelineProps {
  items: ActivityItem[];
  className?: string;
}

export function ActivityTimeline({ items, className }: ActivityTimelineProps) {
  return (
    <div className={cn("space-y-6 pl-4 border-l border-border ml-4", className)}>
      {items.map((item) => (
        <div key={item.id} className="relative">
          <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{item.title}</span>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
