import { useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useClients(filters: ClientFilters = {}) {
  const pipelineId = filters.pipelineId || 'lsNchTsvghJQKPBYCS9Z'; // Default to Buyer

  return useQuery({
    queryKey: qk.clients.list(filters),
    queryFn: async () => {
      // 1. Fetch opportunities for the selected pipeline
      const oppsResponse = await ghlProxy<{ opportunities: any[] }>({
        method: 'POST',
        path: '/opportunities/search',
        body: {
          pipelineId
        }
      });

      const opportunities = oppsResponse.opportunities.map(mapOpportunity);
      if (opportunities.length === 0) return [];

      // 2. Fetch contacts for these opportunities
      const contactIds = Array.from(new Set(opportunities.map(o => o.contactId)));
      
      // GHL search supports multiple IDs via filters
      const contactsResponse = await ghlProxy<{ contacts: any[] }>({
        method: 'POST',
        path: '/contacts/search',
        body: {
          filters: [
            { field: 'id', operator: 'in', value: contactIds }
          ]
        }
      });

      const contacts = contactsResponse.contacts.map(mapContact);

      // 3. Merge
      return opportunities.map(opp => {
        const contact = contacts.find(c => c.id === opp.contactId);
        return {
          ...(contact || { id: opp.contactId, firstName: 'Unknown', lastName: 'Contact', email: '', phone: '', tags: [], role: 'other', customFields: {} }),
          opportunity: opp
        } as Client;
      });
    }
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
