import { Lead } from "@/hooks/useLeads";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { Money } from "@/components/shared/Money";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Phone, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface LeadCardProps {
  lead: Lead;
  className?: string;
}

export function LeadCard({ lead, className }: LeadCardProps) {
  const navigate = useNavigate();
  const initials = `${lead.firstName?.[0] || ""}${lead.lastName?.[0] || ""}`;

  return (
    <Card 
      className={cn("cursor-pointer hover:border-primary/50 transition-colors shadow-1", className)}
      onClick={() => navigate(`/leads/${lead.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-sm text-foreground">
                {lead.firstName} {lead.lastName}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <RoleBadge role={lead.role} />
              </div>
            </div>
          </div>
          {lead.opportunity?.monetaryValue && (
            <Money amount={lead.opportunity.monetaryValue} className="text-sm font-semibold" />
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 mt-4">
          {lead.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span>{lead.phone}</span>
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Added {formatDistanceToNow(new Date(), { addSuffix: true })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
