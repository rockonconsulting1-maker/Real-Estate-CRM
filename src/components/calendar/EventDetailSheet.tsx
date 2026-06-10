import { CalendarEvent } from "@/hooks/useCalendar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventDetailSheetProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReschedule?: (event: CalendarEvent) => void;
  onCancel?: (event: CalendarEvent) => void;
}

export function EventDetailSheet({ event, isOpen, onOpenChange, onReschedule, onCancel }: EventDetailSheetProps) {
  if (!event) return null;

  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-start justify-between">
            <SheetTitle className="text-xl">{event.title}</SheetTitle>
            <Badge variant={event.status === "confirmed" ? "secondary" : "outline"} className="capitalize">
              {event.status}
            </Badge>
          </div>
          <SheetDescription>
            Appointment Details
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-3 text-muted-foreground" />
              <span>{format(start, "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-3 text-muted-foreground" />
              <span>{format(start, "h:mm a")} - {format(end, "h:mm a")}</span>
            </div>
            {event.contactId && (
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 mr-3 text-muted-foreground" />
                <span className="text-accent-brand hover:underline cursor-pointer">View Contact</span>
              </div>
            )}
          </div>

          {event.notes && (
            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium">
                <FileText className="w-4 h-4 mr-2" />
                Notes
              </div>
              <div className="bg-muted/50 p-3 rounded-md text-sm whitespace-pre-wrap">
                {event.notes}
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-2 pt-4 border-t">
            <Button variant="outline" className="w-full" onClick={() => onReschedule?.(event)}>
              Reschedule
            </Button>
            <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onCancel?.(event)}>
              Cancel Appointment
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
