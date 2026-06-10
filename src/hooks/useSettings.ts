import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { inviteAssistant, revokeAssistant, updateAssistantTemplate } from "@/lib/edgeFunctions";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";

export const qkSettings = {
  team: (locationId: string) => ["settings", "team", locationId] as const,
  auditLog: (locationId: string) => ["settings", "auditLog", locationId] as const,
};

export function useTeam() {
  const { ghlLocationId } = useAuth();
  
  return useQuery({
    queryKey: qkSettings.team(ghlLocationId || ""),
    queryFn: async () => {
      if (!ghlLocationId) return [];
      
      const { data, error } = await supabase
        .from("user_location_links")
        .select(`
          *,
          app_users:app_user_id (
            id, email, full_name, avatar_url, role, created_at
          )
        `)
        .eq("ghl_location_id", ghlLocationId);
        
      if (error) throw error;
      
      // Filter out agents, only return assistants
      return data.filter((link: any) => link.app_users?.role === "assistant");
    },
    enabled: !!ghlLocationId,
  });
}

export function useInviteAssistant() {
  const queryClient = useQueryClient();
  const { ghlLocationId } = useAuth();
  
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      return await inviteAssistant(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qkSettings.team(ghlLocationId || "") });
      toast({ title: "Invite Sent", description: "Assistant has been invited." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to invite", 
        description: error.message || "An error occurred", 
        variant: "destructive" 
      });
    }
  });
}

export function useRevokeAssistant() {
  const queryClient = useQueryClient();
  const { ghlLocationId } = useAuth();
  
  return useMutation({
    mutationFn: async ({ assistantUserId }: { assistantUserId: string }) => {
      return await revokeAssistant(assistantUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qkSettings.team(ghlLocationId || "") });
      toast({ title: "Access Revoked", description: "Assistant access has been revoked." });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  const { ghlLocationId } = useAuth();
  
  return useMutation({
    mutationFn: async ({ assistantUserId, template }: { assistantUserId: string, template: string }) => {
      return await updateAssistantTemplate(assistantUserId, template);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qkSettings.team(ghlLocationId || "") });
      toast({ title: "Permissions Updated", description: "Assistant permissions have been updated." });
    },
  });
}

export function useAuditLog() {
  const { ghlLocationId } = useAuth();
  
  return useQuery({
    queryKey: qkSettings.auditLog(ghlLocationId || ""),
    queryFn: async () => {
      if (!ghlLocationId) return [];
      
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .eq("ghl_location_id", ghlLocationId)
        .order("created_at", { ascending: false })
        .limit(100);
        
      if (error) throw error;
      return data;
    },
    enabled: !!ghlLocationId,
  });
}
