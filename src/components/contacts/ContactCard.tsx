import { Contact } from "@/types";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { cn } from "@/lib/utils";
import { relativeDate } from "@/lib/format";
import { Phone, Mail } from "lucide-react";

interface ContactCardProps {
  contact: Contact;
  onClick?: () => void;
  selected?: boolean;
}

export function ContactCard({ contact, onClick, selected }: ContactCardProps) {
  const initials = `${contact.firstName?.[0] || ""}${contact.lastName?.[0] || ""}`.toUpperCase();
  
  return (
    <Card 
      className={cn(
        "p-4 cursor-pointer hover:bg-background-sunk transition-colors border-l-4",
        selected ? "bg-background-sunk border-l-accent-brand" : "border-l-transparent"
      )}
      onClick={onClick}
    >
      <div className="flex gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={contact.avatarUrl || undefined} />
          <AvatarFallback>{initials || "?"}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-foreground truncate">
              {contact.firstName} {contact.lastName}
            </h3>
            {contact.role && <RoleBadge role={contact.role} />}
          </div>
          
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            {contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                <span className="truncate">{contact.phone}</span>
              </div>
            )}
            {contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}
          </div>
          
          {contact.dateAdded && (
            <div className="mt-3 text-xs text-foreground-4">
              Added {relativeDate(contact.dateAdded)}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
