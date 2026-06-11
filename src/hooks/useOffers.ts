import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { Offer } from "@/types";
import { ghlProxy } from "@/lib/ghlProxy";
import { mapOffer } from "@/lib/ghl/offers";
import { toast } from "@/hooks/use-toast";

const OFFERS_PATH = "/objects/custom_objects.real_estate_offer/records";
export const RECORDS_PAGE_LIMIT = 20;

export type SearchAfterCursor = Array<string | number>;

interface RecordsPage<T> {
  items: T[];
  nextCursor: SearchAfterCursor | undefined;
}

/**
 * The Records Search API (POST /objects/{objectKey}/records/search) requires
 * page and pageLimit. Cursor pagination uses searchAfter: each returned record
 * carries a searchAfter array; pass the last record's value to get the next page.
 */
export async function searchRecordsPage<T>(
  objectPath: string,
  mapRecord: (raw: any) => T,
  filters: any[] | undefined,
  cursor: SearchAfterCursor | undefined,
): Promise<RecordsPage<T>> {
  const body: any = {
    page: 1,
    pageLimit: RECORDS_PAGE_LIMIT,
    filters: filters || [],
  };
  if (cursor) body.searchAfter = cursor;

  const response = await ghlProxy<{ records: any[] }>({
    method: "POST",
    path: `${objectPath}/search`,
    body,
  });

  const records = response.records || [];
  const last = records[records.length - 1];
  return {
    items: records.map(mapRecord),
    nextCursor: records.length === RECORDS_PAGE_LIMIT ? last?.searchAfter : undefined,
  };
}

export function useOffers(filters?: any) {
  return useInfiniteQuery({
    queryKey: qk.offers.list(filters),
    queryFn: ({ pageParam }) => searchRecordsPage(OFFERS_PATH, mapOffer, filters, pageParam),
    initialPageParam: undefined as SearchAfterCursor | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => data.pages.flatMap((p) => p.items),
  });
}

export function useOffer(id: string | undefined) {
  return useQuery({
    queryKey: qk.offers.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      const response = await ghlProxy<any>({
        method: "GET",
        path: `${OFFERS_PATH}/${id}`,
      });
      return mapOffer(response);
    },
    enabled: !!id,
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Offer>) => {
      const response = await ghlProxy<any>({
        method: "POST",
        path: OFFERS_PATH,
        body: data,
      });
      return mapOffer(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.offers.lists });
      toast({ title: "Offer Created", description: "The offer has been added successfully." });
    },
  });
}

export function useUpdateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Offer> }) => {
      const response = await ghlProxy<any>({
        method: "PUT",
        path: `${OFFERS_PATH}/${id}`,
        body: data,
      });
      return mapOffer(response);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: qk.offers.lists });
      queryClient.invalidateQueries({ queryKey: qk.offers.detail(variables.id) });
      toast({ title: "Offer Updated", description: "The offer has been updated successfully." });
    },
  });
}

export function useUpdateOfferStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Offer["status"] }) => {
      const response = await ghlProxy<any>({
        method: "PUT",
        path: `${OFFERS_PATH}/${id}`,
        body: { status },
      });
      return mapOffer(response);
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: qk.offers.lists });
      await queryClient.cancelQueries({ queryKey: qk.offers.detail(id) });

      const previousOffer = queryClient.getQueryData<Offer>(qk.offers.detail(id));
      if (previousOffer) {
        queryClient.setQueryData<Offer>(qk.offers.detail(id), { ...previousOffer, status });
      }

      return { previousOffer };
    },
    onError: (err, variables, context) => {
      if (context?.previousOffer) {
        queryClient.setQueryData(qk.offers.detail(variables.id), context.previousOffer);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: qk.offers.lists });
      queryClient.invalidateQueries({ queryKey: qk.offers.detail(variables.id) });
    },
  });
}
