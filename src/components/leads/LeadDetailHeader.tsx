import { Lead } from "@/hooks/useLeads";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, MoreHorizontal } from "lucide-react";
import { LogContactButton } from "./LogContactButton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface LeadDetailHeaderProps {
  lead: Lead;
}

export function LeadDetailHeader({ lead }: LeadDetailHeaderProps) {
  const initials = `${lead.firstName?.[0] || ""}${lead.lastName?.[0] || ""}`;

  return (
    <div className="bg-card border-b border-border p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-background">
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                {lead.firstName} {lead.lastName}
              </h1>
              <RoleBadge role={lead.role} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {lead.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-[10px] uppercase tracking-wider font-bold">
                  {tag}
                </Badge>
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                Last contact: 2 days ago
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LogContactButton leadId={lead.id} />
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Mail className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Lead</DropdownMenuItem>
                <DropdownMenuItem>Share Contact</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete Lead</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
