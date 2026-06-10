import { Contact } from "@/types";
import { ContactCard } from "./ContactCard";
import { AZScrubber } from "@/components/shared/AZScrubber";
import { RecordList } from "@/components/shared/RecordList";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ContactDirectoryListProps {
  contacts: Contact[];
  isLoading: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export function ContactDirectoryList({ contacts, isLoading, selectedId, onSelect }: ContactDirectoryListProps) {
  const navigate = useNavigate();
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.trim().toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    if (!activeLetter) return sortedContacts;
    return sortedContacts.filter(c => {
      const name = `${c.firstName} ${c.lastName}`.trim();
      return name.charAt(0).toUpperCase() === activeLetter;
    });
  }, [sortedContacts, activeLetter]);

  const handleSelect = (id: string) => {
    if (onSelect) {
      onSelect(id);
    } else {
      navigate(`/contacts/${id}`);
    }
  };

  return (
    <div className="relative h-full flex">
      <div className="flex-1 pr-8">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No contacts found</div>
        ) : (
          <RecordList
            items={filteredContacts}
            renderItem={(c) => (
              <ContactCard 
                contact={c} 
                selected={c.id === selectedId}
                onClick={() => handleSelect(c.id)}
              />
            )}
          />
        )}
      </div>
      <div className="w-8 absolute right-0 top-0 bottom-0 py-4 hidden md:block">
        <AZScrubber onSelect={setActiveLetter} />
      </div>
    </div>
  );
}
