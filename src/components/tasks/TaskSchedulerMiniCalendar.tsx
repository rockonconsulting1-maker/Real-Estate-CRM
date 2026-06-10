import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskSchedulerMiniCalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

export function TaskSchedulerMiniCalendar({ onDateSelect, selectedDate }: TaskSchedulerMiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-sm">{format(currentMonth, "MMMM yyyy")}</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-muted-foreground font-medium">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentToday = isToday(day);
          
          return (
            <button
              key={i}
              onClick={() => onDateSelect?.(day)}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-xs transition-colors",
                !isCurrentMonth && "text-muted-foreground/50",
                isCurrentMonth && !isSelected && !isCurrentToday && "hover:bg-muted",
                isCurrentToday && !isSelected && "bg-accent text-accent-foreground font-semibold",
                isSelected && "bg-primary text-primary-foreground font-semibold",
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
        Drag unscheduled tasks here
      </div>
    </div>
  );
}
