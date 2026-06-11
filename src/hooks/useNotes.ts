import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { ghlProxy } from "@/lib/ghlProxy";
import { toast } from "@/hooks/use-toast";
import { Note } from "@/types";
import { mapNote } from "@/lib/ghl/notes";
import { searchNotes } from "@/lib/edgeFunctions";
import { resolveLinkedContact } from "@/lib/ghl/associations";

export interface NotesForResult {
  notes: Note[];
  /** True when the entity has no linked contact — show a "No linked contact" empty state. */
  isUnlinked: boolean;
  contactId: string | null;
}

export function useNotesFor(entityType: "contact" | "opportunity" | "property" | "offer", entityId: string) {
  return useQuery<NotesForResult>({
    queryKey: ["notes", entityType, entityId],
    queryFn: async () => {
      // If not a contact, resolve the contact ID first via associations
      const contactId =
        entityType === "contact"
          ? entityId
          : await resolveLinkedContact(entityType, entityId);

      if (!contactId) {
        return { notes: [], isUnlinked: true, contactId: null };
      }

      const response = await ghlProxy<{ notes: any[] }>({
        method: "GET",
        path: `/contacts/${contactId}/notes`,
      });

      return {
        notes: (response.notes || []).map((n: any) => mapNote({ ...n, contactId })),
        isUnlinked: false,
        contactId,
      };
    },
    enabled: !!entityId,
  });
}

export function useNote(contactId: string, noteId: string) {
  return useQuery({
    queryKey: qk.notes.detail(noteId),
    queryFn: async () => {
      // GHL doesn't have a GET /contacts/{id}/notes/{noteId} that we know of, 
      // but if it does, we can use it. Alternatively, fetch all and filter.
      // Assuming it does:
      try {
        const response = await ghlProxy<any>({
          method: "GET",
          path: `/contacts/${contactId}/notes/${noteId}`,
        });
        return mapNote({ ...response, contactId });
      } catch (e: any) {
        // Fallback: fetch all and find
        const response = await ghlProxy<{ notes: any[] }>({
          method: "GET",
          path: `/contacts/${contactId}/notes`,
        });
        const note = response.notes?.find((n: any) => n.id === noteId);
        if (!note) throw new Error("Note not found");
        return mapNote({ ...note, contactId });
      }
    },
    enabled: !!contactId && !!noteId,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contactId, data }: { contactId: string; data: Partial<Note> }) => {
      const response = await ghlProxy<any>({
        method: "POST",
        path: `/contacts/${contactId}/notes`,
        body: data,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: qk.notes.forContact(variables.contactId) });
      toast({ title: "Note Created", description: "The note has been created successfully." });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contactId, noteId, data }: { contactId: string; noteId: string; data: Partial<Note> }) => {
      const response = await ghlProxy<any>({
        method: "PUT",
        path: `/contacts/${contactId}/notes/${noteId}`,
        body: data,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: qk.notes.forContact(variables.contactId) });
      queryClient.invalidateQueries({ queryKey: qk.notes.detail(variables.noteId) });
      toast({ title: "Note Updated", description: "The note has been updated successfully." });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contactId, noteId }: { contactId: string; noteId: string }) => {
      const response = await ghlProxy<any>({
        method: "DELETE",
        path: `/contacts/${contactId}/notes/${noteId}`,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: qk.notes.forContact(variables.contactId) });
      queryClient.removeQueries({ queryKey: qk.notes.detail(variables.noteId) });
      toast({ title: "Note Deleted", description: "The note has been deleted." });
    },
  });
}

export function useSearchNotes(query: string) {
  return useQuery({
    queryKey: ["notes", "search", query],
    queryFn: async () => {
      if (!query) return [];
      const data = await searchNotes(query, 50);
      return data || [];
    },
    enabled: true, // we might want to enable this always or based on query
  });
}

// Mock function for all notes for the notes page if no search is active
export function useAllNotes() {
  return useQuery({
    queryKey: ["notes", "all"],
    queryFn: async () => {
      // In a real app, this would use a global notes endpoint or search-notes with empty query
      // For the prototype, let's fetch a few contacts and get their notes
      const contactsRes = await ghlProxy<{ contacts: any[] }>({
        method: "POST",
        path: "/contacts/search",
        body: { pageLimit: 20 },
      });
      
      const contacts = contactsRes.contacts || [];
      const allNotes: Note[] = [];
      
      await Promise.all(
        contacts.map(async (c) => {
          try {
            const notesRes = await ghlProxy<{ notes: any[] }>({
              method: "GET",
              path: `/contacts/${c.id}/notes`,
            });
            if (notesRes.notes) {
              const mapped = notesRes.notes.map((n: any) => mapNote({ ...n, contactId: c.id }));
              allNotes.push(...mapped);
            }
          } catch (e) {
            // Ignore
          }
        })
      );
      
      return allNotes.sort((a, b) => new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime());
    },
  });
}
