import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: "buyer" | "seller" | "agent" | "investor" | "other" | string;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const normalizedRole = role.toLowerCase();
  let variant: "default" | "secondary" | "outline" | "destructive" = "secondary";
  let colorClass = "";

  switch (normalizedRole) {
    case "buyer":
      colorClass = "bg-info-soft text-info hover:bg-info-soft/80";
      break;
    case "seller":
      colorClass = "bg-warning-soft text-warning hover:bg-warning-soft/80";
      break;
    case "agent":
      colorClass = "bg-accent-brand-soft text-accent-brand hover:bg-accent-brand-soft/80";
      break;
    case "investor":
      colorClass = "bg-success-soft text-success hover:bg-success-soft/80";
      break;
    default:
      variant = "outline";
  }

  return (
    <Badge variant={variant} className={cn("capitalize font-medium", colorClass, className)}>
      {role}
    </Badge>
  );
}
