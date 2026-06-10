import { CalendarEvent } from "@/hooks/useCalendar";
import { format, isSameDay } from "date-fns";
import { DriveTimePill } from "@/components/shared/DriveTimePill";
import { CalendarEventBlock } from "./CalendarEventBlock";

interface AgendaViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function AgendaView({ events, onEventClick }: AgendaViewProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <p>No upcoming events.</p>
      </div>
    );
  }

  // Group events by day
  const groupedEvents = events.reduce((acc, event) => {
    const day = format(new Date(event.startTime), "yyyy-MM-dd");
    if (!acc[day]) acc[day] = [];
    acc[day].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  return (
    <div className="flex flex-col space-y-6 pb-20 md:pb-0">
      {Object.entries(groupedEvents).map(([day, dayEvents]) => (
        <div key={day} className="space-y-4">
          <div className="sticky top-0 bg-background/95 backdrop-blur z-10 py-2 border-b">
            <h3 className="font-medium">{format(new Date(day), "EEEE, MMMM d")}</h3>
          </div>
          <div className="flex flex-col space-y-3 px-2">
            {dayEvents.map((event, index) => (
              <div key={event.id} className="flex flex-col space-y-3">
                <CalendarEventBlock event={event} onClick={() => onEventClick(event)} />
                {index < dayEvents.length - 1 && (
                  <div className="flex justify-center my-1">
                    <DriveTimePill minutes={15} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
