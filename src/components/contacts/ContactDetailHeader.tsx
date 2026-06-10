import { Contact } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, CheckSquare } from "lucide-react";

interface ContactDetailHeaderProps {
  contact: Contact;
}

export function ContactDetailHeader({ contact }: ContactDetailHeaderProps) {
  const initials = `${contact.firstName?.[0] || ""}${contact.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="bg-card border-b p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
      <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2 border-background shadow-sm">
        <AvatarImage src={contact.avatarUrl || undefined} />
        <AvatarFallback className="text-2xl">{initials || "?"}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold truncate">
            {contact.firstName} {contact.lastName}
          </h1>
          {contact.role && <RoleBadge role={contact.role} />}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Button variant="outline" size="sm" className="gap-2">
            <Phone className="h-4 w-4" /> Call
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquare className="h-4 w-4" /> Text
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Mail className="h-4 w-4" /> Email
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <CheckSquare className="h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>
    </div>
  );
}
