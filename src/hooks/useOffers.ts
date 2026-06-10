import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { Offer } from "@/types";
import { ghlProxy } from "@/lib/ghlProxy";
import { mapOffer } from "@/lib/ghl/offers";
import { toast } from "@/hooks/use-toast";

export function useOffers(filters?: any) {
  return useQuery({
    queryKey: qk.offers.list(filters),
    queryFn: async () => {
      const response = await ghlProxy<{ records: any[] }>({
        method: "POST",
        path: "/objects/custom_objects.real_estate_offer/records/search",
        body: {
          filters: filters || [],
        },
      });
      return response.records.map(mapOffer);
    },
  });
}

export function useOffer(id: string | undefined) {
  return useQuery({
    queryKey: qk.offers.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      const response = await ghlProxy<any>({
        method: "GET",
        path: `/objects/custom_objects.real_estate_offer/records/${id}`,
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
        path: "/objects/custom_objects.real_estate_offer/records",
        body: data,
      });
      return mapOffer(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.offers.list({}) });
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
        path: `/objects/custom_objects.real_estate_offer/records/${id}`,
        body: data,
      });
      return mapOffer(response);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: qk.offers.list({}) });
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
        path: `/objects/custom_objects.real_estate_offer/records/${id}`,
        body: { status },
      });
      return mapOffer(response);
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: qk.offers.list({}) });
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
      queryClient.invalidateQueries({ queryKey: qk.offers.list({}) });
      queryClient.invalidateQueries({ queryKey: qk.offers.detail(variables.id) });
    },
  });
}
