import { Calendar, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface NextAppointmentCardProps {
  title: string;
  date: string;
  time: string;
  location?: string;
  className?: string;
}

export function NextAppointmentCard({ title, date, time, location, className }: NextAppointmentCardProps) {
  return (
    <Card className={cn("bg-accent-brand-soft border-accent-brand/20 shadow-none", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-accent-brand-ink">{title}</h4>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center text-sm text-accent-brand-ink/80">
                <Calendar className="mr-2 h-4 w-4" />
                {date}
              </div>
              <div className="flex items-center text-sm text-accent-brand-ink/80">
                <Clock className="mr-2 h-4 w-4" />
                {time}
              </div>
              {location && (
                <div className="flex items-center text-sm text-accent-brand-ink/80">
                  <MapPin className="mr-2 h-4 w-4" />
                  {location}
                </div>
              )}
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-accent-brand/10 flex items-center justify-center text-accent-brand">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
