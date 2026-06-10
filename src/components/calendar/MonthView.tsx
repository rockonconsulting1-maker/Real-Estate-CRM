import { CalendarEvent } from "@/hooks/useCalendar";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MonthViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function MonthView({ events, onEventClick }: MonthViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-semibold text-lg">{format(currentDate, "MMMM yyyy")}</h2>
        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border flex-1 border rounded-md overflow-hidden">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
          <div key={day} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        
        {days.map((day, i) => {
          const dayEvents = events.filter(e => format(new Date(e.startTime), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"));
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          return (
            <div 
              key={i} 
              className={cn(
                "bg-card min-h-[100px] p-1 flex flex-col",
                !isCurrentMonth && "bg-muted/30 text-muted-foreground opacity-50"
              )}
            >
              <div className={cn(
                "text-right text-sm p-1",
                isToday(day) && "font-bold text-accent-brand"
              )}>
                {format(day, "d")}
              </div>
              <div className="flex-1 overflow-y-auto space-y-1">
                {dayEvents.map(event => (
                  <div 
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="text-[10px] p-1 rounded bg-accent-brand/10 text-accent-brand-ink cursor-pointer hover:bg-accent-brand/20 truncate"
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
