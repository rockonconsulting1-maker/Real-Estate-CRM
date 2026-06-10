import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCalendarEvents } from "@/hooks/useCalendar";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { AgendaView } from "@/components/calendar/AgendaView";
import { DayView } from "@/components/calendar/DayView";
import { WeekView } from "@/components/calendar/WeekView";
import { MonthView } from "@/components/calendar/MonthView";
import { EventDetailSheet } from "@/components/calendar/EventDetailSheet";
import { AddAppointmentDrawer } from "@/components/calendar/AddAppointmentDrawer";
import { ConflictBanner } from "@/components/calendar/ConflictBanner";
import { CalendarEvent } from "@/hooks/useCalendar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ContextFAB } from "@/components/layout/ContextFAB";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";

type CalendarView = "agenda" | "day" | "week" | "month";

export default function Calendar() {
  const isMobile = useIsMobile();
  const [view, setView] = useState<CalendarView>(isMobile ? "agenda" : "week");
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Calculate range to fetch based on view (fetching month to be safe)
  const rangeStart = startOfWeek(startOfMonth(currentDate)).toISOString();
  const rangeEnd = endOfWeek(endOfMonth(currentDate)).toISOString();

  // Mock calendarId for now, would come from context/settings
  const { data: events = [], isLoading } = useCalendarEvents({
    startTime: rangeStart,
    endTime: rangeEnd,
    calendarId: "default-calendar-id"
  });

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };

  // Detect conflicts (simple mock logic: any overlapping times)
  const conflictsCount = 0; // In a real app, calculate actual conflicts

  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Calendar" 
        action={
          !isMobile && (
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          )
        }
      />
      
      <div className="mt-4 md:mt-0 pb-2 md:pb-0 px-4 md:px-6">
        <ToggleGroup 
          type="single" 
          value={view} 
          onValueChange={(v) => v && setView(v as CalendarView)}
          className="justify-start md:justify-end"
        >
          {isMobile && <ToggleGroupItem value="agenda">Agenda</ToggleGroupItem>}
          <ToggleGroupItem value="day">Day</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col">
        {!isMobile && <ConflictBanner conflictsCount={conflictsCount} onReschedule={() => {}} />}

        <div className="flex-1 bg-background rounded-lg md:border md:shadow-sm md:p-4 overflow-hidden">
          {isLoading ? (
            <SkeletonLoader variant="list-row" />
          ) : (
            <>
              {view === "agenda" && <AgendaView events={events} onEventClick={handleEventClick} />}
              {view === "day" && <DayView events={events} onEventClick={handleEventClick} />}
              {view === "week" && <WeekView events={events} onEventClick={handleEventClick} />}
              {view === "month" && <MonthView events={events} onEventClick={handleEventClick} />}
            </>
          )}
        </div>
      </div>

      <EventDetailSheet 
        event={selectedEvent} 
        isOpen={isDetailOpen} 
        onOpenChange={setIsDetailOpen} 
      />

      <AddAppointmentDrawer 
        isOpen={isAddOpen} 
        onOpenChange={setIsAddOpen} 
      />

      {isMobile && (
        <ContextFAB 
          icon={<Plus />} 
          onClick={() => setIsAddOpen(true)} 
        />
      )}
    </div>
  );
}
