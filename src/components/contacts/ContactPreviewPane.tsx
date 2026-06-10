import { Contact } from "@/types";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, CalendarPlus, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ContactPreviewPaneProps {
  contact: Contact | null;
  isLoading: boolean;
}

export function ContactPreviewPane({ contact, isLoading }: ContactPreviewPaneProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-muted-foreground">
        Select a contact to view details
      </div>
    );
  }

  const initials = `${contact.firstName?.[0] || ""}${contact.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="flex flex-col items-center text-center mb-8">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={contact.avatarUrl || undefined} />
          <AvatarFallback className="text-2xl">{initials || "?"}</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-bold mb-2">{contact.firstName} {contact.lastName}</h2>
        {contact.role && <RoleBadge role={contact.role} className="mb-4" />}
        
        <div className="flex gap-2 w-full justify-center mt-2">
          <Button variant="outline" size="icon" className="rounded-full">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <Mail className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <CalendarPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Contact Info</h3>
          <div className="space-y-3 text-sm">
            {contact.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{contact.phone}</span>
              </div>
            )}
            {contact.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{contact.email}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Button 
        className="w-full mt-6" 
        onClick={() => navigate(`/contacts/${contact.id}`)}
      >
        View Full Profile <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
