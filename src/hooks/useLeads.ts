import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ghlProxy } from "@/lib/ghlProxy";
import { qk } from "@/lib/queryKeys";
import { mapContact } from "@/lib/ghl/contacts";
import { mapOpportunity } from "@/lib/ghl/opportunities";
import { Contact, Opportunity } from "@/types";
import { toast } from "sonner";
import { usePipelines } from "@/providers/PipelineConfigProvider";

export interface LeadFilters {
  status?: 'Hot' | 'Warm' | 'Cold';
  role?: 'Buyer' | 'Seller' | 'Both' | 'Investor' | 'Renter';
  search?: string;
  sortBy?: 'date_added' | 'last_contact' | 'name' | 'lead_score';
}

export interface Lead extends Contact {
  opportunity?: Opportunity;
}

const LEADS_PAGE_LIMIT = 20;

export function useLeads(filters: LeadFilters = {}) {
  const { leadPipeline, isResolved } = usePipelines();

  return useInfiniteQuery({
    queryKey: qk.leads.list(filters),
    queryFn: async ({ pageParam }) => {
      if (!leadPipeline) throw new Error("Lead pipeline not resolved");

      // 1. Search contacts with lead tags (paged; locationId injected server-side)
      const contactsResponse = await ghlProxy<{ contacts: any[] }>({
        method: 'POST',
        path: '/contacts/search',
        body: {
          page: pageParam,
          pageLimit: LEADS_PAGE_LIMIT,
          filters: [
            { field: 'tags', operator: 'contains', value: 'lead' }
          ],
        }
      });

      const contacts = (contactsResponse.contacts || []).map(mapContact);

      // 2. Fetch opportunities for these contacts in the Lead Nurture pipeline
      const oppsResponse = await ghlProxy<{ opportunities: any[] }>({
        method: 'POST',
        path: '/opportunities/search',
        body: {
          pipelineId: leadPipeline.id
        }
      });

      const opportunities = (oppsResponse.opportunities || []).map(mapOpportunity);

      // 3. Merge
      return contacts.map(contact => ({
        ...contact,
        opportunity: opportunities.find(o => o.contactId === contact.id)
      })) as Lead[];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _all, lastPageParam) =>
      lastPage.length === LEADS_PAGE_LIMIT ? lastPageParam + 1 : undefined,
    select: (data) => data.pages.flat(),
    enabled: isResolved
  });
}

export function useLead(id: string) {
  const { leadPipeline, isResolved } = usePipelines();

  return useQuery({
    queryKey: qk.leads.detail(id),
    queryFn: async () => {
      if (!leadPipeline) throw new Error("Lead pipeline not resolved");

      const contactRaw = await ghlProxy<any>({
        method: 'GET',
        path: `/contacts/${id}`
      });
      
      const contact = mapContact(contactRaw.contact);

      // Fetch opportunity
      const oppsResponse = await ghlProxy<{ opportunities: any[] }>({
        method: 'POST',
        path: '/opportunities/search',
        body: {
          contactId: id,
          pipelineId: leadPipeline.id
        }
      });

      const opportunity = oppsResponse.opportunities.length > 0 
        ? mapOpportunity(oppsResponse.opportunities[0])
        : undefined;

      return { ...contact, opportunity } as Lead;
    },
    enabled: isResolved && !!id
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  const { leadPipeline } = usePipelines();

  return useMutation({
  mutationFn: async (data: Partial<Lead>) => {
      if (!leadPipeline) throw new Error("Lead pipeline not resolved");

      // 1. Create contact
      const contactRes = await ghlProxy<{ contact: any }>({
        method: 'POST',
        path: '/contacts/',
        body: {
          ...data,
          tags: [...(data.tags || []), 'lead']
        }
      });

      const contactId = contactRes.contact.id;

      // 2. Create opportunity in Lead Nurture pipeline
      await ghlProxy({
        method: 'POST',
        path: '/opportunities/',
        body: {
          pipelineId: leadPipeline.id,
          pipelineStageId: leadPipeline.stages[0]?.id, // Use the first stage as initial
          name: `${data.firstName} ${data.lastName} - Lead`,
          contactId
        }
      });

      return contactRes.contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.leads.lists });
      toast.success("Lead created successfully");
    }
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Lead> & { id: string }) => {
      await ghlProxy({
        method: 'PUT',
        path: `/contacts/${id}`,
        body: data
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: qk.leads.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: qk.leads.lists });
      toast.success("Lead updated");
    }
  });
}

export function useUpdateOpportunityStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stageId }: { id: string, stageId: string }) => {
      return ghlProxy({
        method: 'PUT',
        path: `/opportunities/${id}`,
        body: { pipelineStageId: stageId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.leads.lists });
      queryClient.invalidateQueries({ queryKey: qk.clients.lists });
      queryClient.invalidateQueries({ queryKey: qk.dashboard.summary });
    }
  });
}

export function useConvertToClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ leadId, pipelineId, stageId }: { leadId: string, pipelineId: string, stageId: string }) => {
      // Implementation: move opportunity to new pipeline, update tags
      // This is a placeholder for the actual logic
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.leads.lists });
      queryClient.invalidateQueries({ queryKey: qk.clients.lists });
      toast.success("Converted to client");
    }
  });
}
