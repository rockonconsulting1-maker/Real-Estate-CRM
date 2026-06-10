import { CalendarEvent } from "@/hooks/useCalendar";
import { format, addDays, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { CalendarEventBlock } from "./CalendarEventBlock";

interface DayViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function DayView({ events, onEventClick }: DayViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const dayEvents = events.filter(e => {
    return format(new Date(e.startTime), "yyyy-MM-dd") === format(currentDate, "yyyy-MM-dd");
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subDays(currentDate, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-semibold text-lg">{format(currentDate, "EEEE, MMM d, yyyy")}</h2>
        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {dayEvents.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            No events scheduled for this day.
          </div>
        ) : (
          <div className="space-y-3">
            {dayEvents.map(event => (
              <CalendarEventBlock key={event.id} event={event} onClick={() => onEventClick(event)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
