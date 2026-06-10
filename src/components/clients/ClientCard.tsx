import { Client } from "@/hooks/useClients";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { Money } from "@/components/shared/Money";
import { cn } from "@/lib/utils";
import { Phone, Mail, MapPin } from "lucide-react";

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
  className?: string;
}

export function ClientCard({ client, onClick, className }: ClientCardProps) {
  const initials = `${client.firstName?.[0] || ""}${client.lastName?.[0] || ""}`.toUpperCase();
  const value = client.opportunity?.monetaryValue || 0;

  return (
    <Card 
      className={cn(
        "p-4 cursor-pointer hover:bg-background-sunk transition-all border-l-4 border-l-transparent hover:border-l-accent-brand group",
        className
      )}
      onClick={onClick}
    >
      <div className="flex gap-4">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={client.avatarUrl || undefined} />
          <AvatarFallback>{initials || "?"}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1 gap-2">
            <h3 className="font-semibold text-foreground truncate group-hover:text-accent-brand transition-colors">
              {client.firstName} {client.lastName}
            </h3>
            {client.role && <RoleBadge role={client.role} />}
          </div>
          
          <div className="space-y-1 mb-3">
            {client.address1 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{client.address1}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {client.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate max-w-[100px]">{client.email}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border-2">
            <span className="text-xs font-medium text-foreground-2">Deal Value</span>
            <div className="text-sm font-bold text-accent-brand">
              <Money amount={value} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
