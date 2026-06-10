import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ghlProxy } from "@/lib/ghlProxy";
import { qk } from "@/lib/queryKeys";
import { mapContact } from "@/lib/ghl/contacts";
import { Contact } from "@/types";

export interface ContactFilters {
  query?: string;
  role?: string;
}

export function useContacts(filters: ContactFilters = {}) {
  return useQuery({
    queryKey: qk.contacts.list(filters),
    queryFn: async () => {
      // Note: role filter might need to be translated to GHL tags/fields
      const body: any = { locationId: "placeholder", pageLimit: 50 };
      if (filters.query) body.query = filters.query;
      
      const res = await ghlProxy<{ contacts: any[] }>({
        method: "POST",
        path: "/contacts/search",
        body,
      });
      return (res.contacts || []).map(mapContact);
    },
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: qk.contacts.detail(id),
    queryFn: async () => {
      const res = await ghlProxy<{ contact: any }>({
        method: "GET",
        path: `/contacts/${id}`,
      });
      return mapContact(res.contact);
    },
    enabled: !!id,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Contact>) => {
      const res = await ghlProxy<{ contact: any }>({
        method: "POST",
        path: "/contacts/",
        body: data,
      });
      return mapContact(res.contact);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.contacts.all });
    },
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Contact> }) => {
      const res = await ghlProxy<{ contact: any }>({
        method: "PUT",
        path: `/contacts/${id}`,
        body: data,
      });
      return mapContact(res.contact);
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: qk.contacts.detail(updated.id) });
      qc.invalidateQueries({ queryKey: qk.contacts.list({} as any) });
    },
  });
}
