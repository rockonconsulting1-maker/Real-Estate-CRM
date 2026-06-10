import { CalendarEvent } from "@/hooks/useCalendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarEventBlockProps {
  event: CalendarEvent;
  onClick?: () => void;
  className?: string;
}

export function CalendarEventBlock({ event, onClick, className }: CalendarEventBlockProps) {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex flex-col p-3 rounded-md border border-l-4 bg-card cursor-pointer hover:bg-muted/50 transition-colors",
        event.status === "confirmed" ? "border-l-accent-brand" : "border-l-warning",
        className
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="font-semibold text-sm line-clamp-1">{event.title}</span>
        <span className="text-xs font-medium whitespace-nowrap text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {format(start, "h:mm a")} - {format(end, "h:mm a")}
        </span>
      </div>
      {event.notes && (
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{event.notes}</p>
      )}
    </div>
  );
}
