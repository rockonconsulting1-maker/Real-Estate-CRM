import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { cn } from "@/lib/utils";

interface NewLeadsListProps {
  leads: any[];
  className?: string;
}

export function NewLeadsList({ leads, className }: NewLeadsListProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">New Leads</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {leads.length === 0 ? (
          <div className="text-sm text-muted-foreground">No new leads.</div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{lead.name}</span>
                    <span className="text-xs text-muted-foreground">{lead.time}</span>
                  </div>
                </div>
                <RoleBadge role={lead.role} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
