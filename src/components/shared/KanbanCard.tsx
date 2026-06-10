import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface KanbanCardProps {
  id: string;
  title: string;
  subtitle?: string;
  content?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function KanbanCard({ title, subtitle, content, footer, className }: KanbanCardProps) {
  return (
    <Card className={cn("mb-3 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors shadow-1", className)}>
      <CardContent className="p-3">
        <h4 className="font-medium text-sm text-foreground">{title}</h4>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        {content && <div className="mt-2 text-sm">{content}</div>}
        {footer && <div className="mt-3 flex items-center justify-between">{footer}</div>}
      </CardContent>
    </Card>
  );
}
