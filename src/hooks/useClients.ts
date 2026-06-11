import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ghlProxy } from "@/lib/ghlProxy";
import { qk } from "@/lib/queryKeys";
import { mapContact } from "@/lib/ghl/contacts";
import { mapOpportunity } from "@/lib/ghl/opportunities";
import { Contact, Opportunity } from "@/types";

export interface ClientFilters {
  pipelineId?: 'lsNchTsvghJQKPBYCS9Z' | 'F5uB4bZnB0M8YgJ86sLg'; // Buyer | Seller
  search?: string;
  stageId?: string;
}

export interface Client extends Contact {
  opportunity?: Opportunity;
}

const CLIENTS_PAGE_LIMIT = 20;

/**
 * The Contacts Search API filter operators (eq, not_eq, contains, not_contains,
 * exists, not_exists, range) do not include `in`, so a batch id lookup isn't
 * expressible as a single search. Fall back to parallel GET /contacts/{id},
 * tolerating individual failures.
 */
async function fetchContactsByIds(contactIds: string[]): Promise<Contact[]> {
  const results = await Promise.allSettled(
    contactIds.map((id) =>
      ghlProxy<{ contact: any }>({ method: 'GET', path: `/contacts/${id}` }),
    ),
  );

  return results
    .filter((r): r is PromiseFulfilledResult<{ contact: any }> => r.status === 'fulfilled')
    .map((r) => mapContact(r.value.contact));
}

export function useClients(filters: ClientFilters = {}) {
  const pipelineId = filters.pipelineId || 'lsNchTsvghJQKPBYCS9Z'; // Default to Buyer

  return useInfiniteQuery({
    queryKey: qk.clients.list(filters),
    queryFn: async ({ pageParam }) => {
      // 1. Fetch a page of opportunities for the selected pipeline
      const oppsResponse = await ghlProxy<{ opportunities: any[] }>({
        method: 'POST',
        path: '/opportunities/search',
        body: {
          pipelineId,
          page: pageParam,
          limit: CLIENTS_PAGE_LIMIT,
        },
      });

      const opportunities = (oppsResponse.opportunities || []).map(mapOpportunity);
      if (opportunities.length === 0) return [] as Client[];

      // 2. Fetch contacts for these opportunities
      const contactIds = Array.from(new Set(opportunities.map(o => o.contactId)));
      const contacts = await fetchContactsByIds(contactIds);

      // 3. Merge
      return opportunities.map(opp => {
        const contact = contacts.find(c => c.id === opp.contactId);
        return {
          ...(contact || { id: opp.contactId, firstName: 'Unknown', lastName: 'Contact', email: '', phone: '', tags: [], role: 'other', customFields: {} }),
          opportunity: opp
        } as Client;
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _all, lastPageParam) =>
      lastPage.length === CLIENTS_PAGE_LIMIT ? lastPageParam + 1 : undefined,
    select: (data) => data.pages.flat(),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: qk.clients.detail(id),
    queryFn: async () => {
      // id here is the contactId
      const contactRaw = await ghlProxy<any>({
        method: 'GET',
        path: `/contacts/${id}`
      });

      const contact = mapContact(contactRaw.contact);

      // Fetch opportunities for this contact in either Buyer or Seller pipelines
      const oppsResponse = await ghlProxy<{ opportunities: any[] }>({
        method: 'POST',
        path: '/opportunities/search',
        body: {
          contactId: id,
          // We search across both client pipelines
          pipelineIds: ['lsNchTsvghJQKPBYCS9Z', 'F5uB4bZnB0M8YgJ86sLg']
        }
      });

      const opportunities = oppsResponse.opportunities.map(mapOpportunity);

      return { ...contact, opportunity: opportunities[0], opportunities } as Client & { opportunities: Opportunity[] };
    },
    enabled: !!id
  });
}
