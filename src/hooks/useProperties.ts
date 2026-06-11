import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk as queryKeys } from "@/lib/queryKeys";
import { Property } from "@/types";
import { ghlProxy } from "@/lib/ghlProxy";
import { mapProperty } from "@/lib/ghl/properties";
import { searchRecordsPage, SearchAfterCursor } from "@/hooks/useOffers";

const PROPERTIES_PATH = "/objects/custom_objects.properties/records";

export function useProperties(filters?: any) {
  return useInfiniteQuery({
    queryKey: queryKeys.properties.list(filters),
    queryFn: ({ pageParam }) => searchRecordsPage(PROPERTIES_PATH, mapProperty, filters, pageParam),
    initialPageParam: undefined as SearchAfterCursor | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => data.pages.flatMap((p) => p.items),
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.properties.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      const response = await ghlProxy<any>({
        method: "GET",
        path: `${PROPERTIES_PATH}/${id}`,
      });
      return mapProperty(response);
    },
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Property>) => {
      const response = await ghlProxy<any>({
        method: "POST",
        path: PROPERTIES_PATH,
        body: data,
      });
      return mapProperty(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.lists });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Property> }) => {
      const response = await ghlProxy<any>({
        method: "PUT",
        path: `${PROPERTIES_PATH}/${id}`,
        body: data,
      });
      return mapProperty(response);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.lists });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.detail(variables.id) });
    },
  });
}
