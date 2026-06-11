import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ghlProxy } from "@/lib/ghlProxy";
import { qk } from "@/lib/queryKeys";
import { mapContact } from "@/lib/ghl/contacts";
import { Contact } from "@/types";

export interface ContactFilters {
  query?: string;
  role?: string;
}

export const CONTACTS_PAGE_LIMIT = 20;

export function useContacts(filters: ContactFilters = {}) {
  return useInfiniteQuery({
    queryKey: qk.contacts.list(filters),
    queryFn: async ({ pageParam }) => {
      // Note: role filter might need to be translated to GHL tags/fields.
      // locationId is injected server-side by ghl-proxy — never send it.
      const body: any = { page: pageParam, pageLimit: CONTACTS_PAGE_LIMIT };
      if (filters.query) body.query = filters.query;

      const res = await ghlProxy<{ contacts: any[] }>({
        method: "POST",
        path: "/contacts/search",
        body,
      });
      return (res.contacts || []).map(mapContact);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _all, lastPageParam) =>
      lastPage.length === CONTACTS_PAGE_LIMIT ? lastPageParam + 1 : undefined,
    select: (data) => data.pages.flat(),
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
      qc.invalidateQueries({ queryKey: qk.contacts.lists });
    },
  });
}
