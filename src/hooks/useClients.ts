import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ghlProxy } from "@/lib/ghlProxy";
import { qk } from "@/lib/queryKeys";
import { mapContact } from "@/lib/ghl/contacts";
import { mapOpportunity } from "@/lib/ghl/opportunities";
import { Contact, Opportunity } from "@/types";
import { usePipelines } from "@/providers/PipelineConfigProvider";

export interface ClientFilters {
  pipelineId?: string; // Buyer | Seller
  search?: string;
  stageId?: string;
}

export interface Client extends Contact {
  opportunity?: Opportunity;
}

const CLIENTS_PAGE_LIMIT = 20;

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
  const { buyerPipeline, sellerPipeline, isResolved } = usePipelines();
  const defaultPipelineId = buyerPipeline?.id;
  const pipelineId = filters.pipelineId || defaultPipelineId;

  return useInfiniteQuery({
    queryKey: qk.clients.list(filters),
    queryFn: async ({ pageParam }) => {
      if (!pipelineId) throw new Error("Pipeline ID not resolved");

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
    enabled: isResolved && !!pipelineId
  });
}

export function useClient(id: string) {
  const { buyerPipeline, sellerPipeline, isResolved } = usePipelines();

  return useQuery({
    queryKey: qk.clients.detail(id),
    queryFn: async () => {
      if (!buyerPipeline || !sellerPipeline) throw new Error("Client pipelines not resolved");

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
          pipelineIds: [buyerPipeline.id, sellerPipeline.id]
        }
      });

      const opportunities = oppsResponse.opportunities.map(mapOpportunity);

      return { ...contact, opportunity: opportunities[0], opportunities } as Client & { opportunities: Opportunity[] };
    },
    enabled: isResolved && !!id
  });
}
