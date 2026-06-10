import { CalendarEvent } from "@/hooks/useCalendar";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { CalendarEventBlock } from "./CalendarEventBlock";

interface WeekViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function WeekView({ events, onEventClick }: WeekViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-semibold text-lg">
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2 flex-1 min-h-[500px]">
        {daysInWeek.map((day, i) => {
          const dayEvents = events.filter(e => format(new Date(e.startTime), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"))
                                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
          return (
            <div key={i} className="flex flex-col border rounded-md overflow-hidden bg-card/50">
              <div className="bg-muted p-2 text-center border-b">
                <div className="text-xs text-muted-foreground uppercase">{format(day, "EEE")}</div>
                <div className="font-semibold">{format(day, "d")}</div>
              </div>
              <div className="flex-1 p-1 space-y-1 overflow-y-auto">
                {dayEvents.map(event => (
                  <div 
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="text-[10px] p-1.5 rounded bg-accent-brand/10 border border-accent-brand/20 text-accent-brand-ink cursor-pointer hover:bg-accent-brand/20 truncate"
                  >
                    {format(new Date(event.startTime), "h:mm")} {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
