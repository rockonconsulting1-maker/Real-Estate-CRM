import { useParams, useNavigate } from "react-router-dom";
import { useContact } from "@/hooks/useContacts";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactDetailHeader } from "@/components/contacts/ContactDetailHeader";
import { ContactDetailSections } from "@/components/contacts/ContactDetailSections";
import { DetailTabs } from "@/components/shared/DetailTabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Edit2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { EditContactDrawer } from "@/components/shared/forms/EditContactDrawer";

export default function ContactDetail() {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();
  const { data: contact, isLoading } = useContact(contactId!);
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading contact...</div>;
  }

  if (!contact) {
    return (
      <div className="p-8">
        <Button variant="ghost" onClick={() => navigate("/contacts")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Contacts
        </Button>
        <EmptyState 
          icon="🔍"
          title="Contact not found" 
          description="This contact may have been deleted or you don't have permission to view it." 
        />
      </div>
    );
  }

  const role = contact.role || "other";
  
  const tabs = [
    { value: "details", label: "Details", content: <ContactDetailSections contact={contact} /> },
    { value: "tasks", label: "Tasks", content: renderEmptyTab("tasks") },
    { value: "notes", label: "Notes", content: renderEmptyTab("notes") },
    { value: "appointments", label: "Appointments", content: renderEmptyTab("appointments") },
    ...(!["vendor", "soi", "other"].includes(role) ? [
      { value: "opportunities", label: "Opportunities", content: renderEmptyTab("opportunities") },
      { value: "properties", label: "Properties", content: renderEmptyTab("properties") },
      { value: "offers", label: "Offers", content: renderEmptyTab("offers") }
    ] : [])
  ];

  function renderEmptyTab(tabId: string) {
    return (
      <div className="py-8">
        <EmptyState 
          icon="📁"
          title={`No ${tabId} yet`} 
          description={`There are no ${tabId} associated with this contact.`} 
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PageHeader 
        title="Contact Detail" 
        action={
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
            <Edit2 className="h-4 w-4 mr-2" /> Edit
          </Button>
        }
      />
      
      <div className="flex-1 overflow-y-auto">
        <ContactDetailHeader contact={contact} />
        
        <div className="p-4 md:p-6">
          <DetailTabs 
            tabs={tabs} 
            defaultValue="details" 
          />
        </div>
      </div>

      <EditContactDrawer 
        contact={contact} 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
      />
    </div>
  );
}
