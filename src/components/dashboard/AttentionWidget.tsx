import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, UserPlus, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttentionWidgetProps {
  overdueTasks: number;
  newLeadsCount: number;
  pendingOffersCount: number;
  className?: string;
}

export function AttentionWidget({ overdueTasks, newLeadsCount, pendingOffersCount, className }: AttentionWidgetProps) {
  return (
    <Card className={cn("border-destructive/20 bg-destructive/5", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-destructive flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          Needs Attention
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-destructive">{overdueTasks}</span>
          <span className="text-xs text-muted-foreground">Overdue tasks</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-foreground">{newLeadsCount}</span>
          <span className="text-xs text-muted-foreground">New leads</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-foreground">{pendingOffersCount}</span>
          <span className="text-xs text-muted-foreground">Pending offers</span>
        </div>
      </CardContent>
    </Card>
  );
}
