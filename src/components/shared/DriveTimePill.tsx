import { Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface DriveTimePillProps {
  minutes: number;
  className?: string;
}

export function DriveTimePill({ minutes, className }: DriveTimePillProps) {
  let colorClass = "bg-success-soft text-success";
  if (minutes > 45) colorClass = "bg-destructive-soft text-destructive";
  else if (minutes > 20) colorClass = "bg-warning-soft text-warning";

  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", colorClass, className)}>
      <Car className="h-3.5 w-3.5" />
      <span>{minutes}m drive</span>
    </div>
  );
}
