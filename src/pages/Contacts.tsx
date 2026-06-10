import { useState } from "react";
import { useContacts } from "@/hooks/useContacts";
import { PageHeader } from "@/components/layout/PageHeader";
import { FilterChipRow } from "@/components/shared/FilterChipRow";
import { ContactDirectoryList } from "@/components/contacts/ContactDirectoryList";
import { ContactPreviewPane } from "@/components/contacts/ContactPreviewPane";
import { MasterDetailLayout } from "@/components/shared/MasterDetailLayout";
import { ContextFAB } from "@/components/layout/ContextFAB";
import { AddContactModal } from "@/components/shared/forms/AddContactModal";
import { UserPlus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const ROLE_CHIPS = [
  { id: "leads", label: "Leads" },
  { id: "clients", label: "Clients" },
  { id: "past_clients", label: "Past Clients" },
  { id: "vendors", label: "Vendors" },
  { id: "soi", label: "SOI" },
  { id: "other", label: "Other" },
];

export default function Contacts() {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | undefined>();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const isMobile = useIsMobile();

  // For now, if no role selected, we fetch all.
  const roleFilter = selectedRoles.length > 0 ? selectedRoles[0] : undefined;
  
  const { data: contacts = [], isLoading } = useContacts({ role: roleFilter });

  const selectedContact = contacts.find(c => c.id === selectedContactId) || null;

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="Contacts" />
      
      <div className="px-4 py-2 border-b">
        <FilterChipRow 
          chips={ROLE_CHIPS} 
          selectedIds={selectedRoles} 
          onChange={setSelectedRoles} 
        />
      </div>

      <div className="flex-1 overflow-hidden relative">
        <MasterDetailLayout
          master={
            <div className="h-full overflow-y-auto p-4">
              <ContactDirectoryList 
                contacts={contacts} 
                isLoading={isLoading} 
                selectedId={selectedContactId}
                onSelect={setSelectedContactId}
              />
            </div>
          }
          detail={
            <ContactPreviewPane 
              contact={selectedContact} 
              isLoading={isLoading && !!selectedContactId} 
            />
          }
          isDetailOpen={!!selectedContactId && !isMobile}
          onDetailClose={() => setSelectedContactId(undefined)}
        />

        <ContextFAB 
          icon={<UserPlus />}
          onClick={() => setIsAddModalOpen(true)} 
        />
      </div>

      <AddContactModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen} 
      />
    </div>
  );
}
