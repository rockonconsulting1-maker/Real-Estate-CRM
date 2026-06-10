import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon | ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  const isLucideIcon = typeof Icon === 'function';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] rounded-lg border border-dashed border-border-2 bg-background-sunk">
      <div className="mb-4 rounded-full bg-background p-3 shadow-sm border border-border">
        {isLucideIcon ? (
          <Icon className="h-6 w-6 text-muted-foreground" />
        ) : (
          <div className="text-2xl">{Icon}</div>
        )}
      </div>
      <h3 className="h3 mb-1">{title}</h3>
      <p className="text-muted-foreground caption mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  );
}
