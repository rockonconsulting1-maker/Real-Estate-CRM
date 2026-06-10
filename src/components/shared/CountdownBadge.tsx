import { Badge } from "@/components/ui/badge";
import { countdown } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CountdownBadgeProps {
  date: string | null | undefined;
  className?: string;
}

export function CountdownBadge({ date, className }: CountdownBadgeProps) {
  if (!date) return null;
  
  const text = countdown(date);
  const isOverdue = text.includes("overdue");
  const isToday = text === "Today";
  const isSoon = text.includes("in 1d") || text.includes("in 2d");

  let colorClass = "bg-secondary text-secondary-foreground";
  if (isOverdue) colorClass = "bg-destructive-soft text-destructive hover:bg-destructive-soft/80";
  else if (isToday || isSoon) colorClass = "bg-warning-soft text-warning hover:bg-warning-soft/80";
  else colorClass = "bg-success-soft text-success hover:bg-success-soft/80";

  return (
    <Badge variant="secondary" className={cn(colorClass, className)}>
      {text}
    </Badge>
  );
}
