import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk as queryKeys } from "@/lib/queryKeys";
import { Property } from "@/types";

export function useProperties(filters?: any) {
  return useQuery({
    queryKey: queryKeys.properties.list(filters),
    queryFn: async () => {
      // Mock for now until API is wired
      return [] as Property[];
    },
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.properties.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      return null as unknown as Property;
    },
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Property>) => {
      // Mock create
      return data as Property;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Property> }) => {
      // Mock update
      return data as Property;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.detail(variables.id) });
    },
  });
}
