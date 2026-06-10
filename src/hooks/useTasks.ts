import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { ghlProxy } from "@/lib/ghlProxy";
import { toast } from "@/hooks/use-toast";
import { Task } from "@/types";
import { mapTask } from "@/lib/ghl/tasks";

// This is a simplified version for the prototype. In a real app,
// you'd need a more robust way to fetch all tasks across contacts.
export function useAllTasks() {
  return useQuery({
    queryKey: qk.tasks.all,
    queryFn: async () => {
      // Fetch a small set of contacts first to get their tasks
      const contactsRes = await ghlProxy<{ contacts: any[] }>({
        method: "POST",
        path: "/contacts/search",
        body: { pageLimit: 20 },
      });
      
      const contacts = contactsRes.contacts || [];
      const allTasks: Task[] = [];
      
      // Fetch tasks for each contact
      await Promise.all(
        contacts.map(async (c) => {
          try {
            const tasksRes = await ghlProxy<{ tasks: any[] }>({
              method: "GET",
              path: `/contacts/${c.id}/tasks`,
            });
            if (tasksRes.tasks) {
              const mapped = tasksRes.tasks.map((t: any) => mapTask({ ...t, contactId: c.id }));
              allTasks.push(...mapped);
            }
          } catch (e) {
            // Ignore errors for individual contacts
          }
        })
      );
      
      return allTasks;
    },
  });
}

export function useTasksFor(entityType: "contact" | "opportunity" | "property" | "offer", entityId: string) {
  return useQuery({
    queryKey: ["tasks", entityType, entityId],
    queryFn: async () => {
      let contactId = entityId;
      
      // If not a contact, resolve the contact ID first via associations
      if (entityType !== "contact") {
        // Mock resolution for now
        // contactId = await resolveLinkedContact(entityId);
      }
      
      const response = await ghlProxy<{ tasks: any[] }>({
        method: "GET",
        path: `/contacts/${contactId}/tasks`,
      });
      
      return (response.tasks || []).map((t: any) => mapTask({ ...t, contactId }));
    },
    enabled: !!entityId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contactId, data }: { contactId: string; data: Partial<Task> }) => {
      const response = await ghlProxy<any>({
        method: "POST",
        path: `/contacts/${contactId}/tasks`,
        body: data,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: qk.tasks.all });
      queryClient.invalidateQueries({ queryKey: qk.tasks.forContact(variables.contactId) });
      toast({ title: "Task Created", description: "The task has been created successfully." });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contactId, taskId, data }: { contactId: string; taskId: string; data: Partial<Task> }) => {
      const response = await ghlProxy<any>({
        method: "PUT",
        path: `/contacts/${contactId}/tasks/${taskId}`,
        body: data,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: qk.tasks.all });
      queryClient.invalidateQueries({ queryKey: qk.tasks.forContact(variables.contactId) });
      toast({ title: "Task Updated", description: "The task has been updated successfully." });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contactId, taskId, completed }: { contactId: string; taskId: string; completed: boolean }) => {
      const response = await ghlProxy<any>({
        method: "PUT",
        path: `/contacts/${contactId}/tasks/${taskId}`,
        body: { status: completed ? "completed" : "pending" },
      });
      return response;
    },
    onMutate: async ({ contactId, taskId, completed }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: qk.tasks.all });
      const previousTasks = queryClient.getQueryData<Task[]>(qk.tasks.all);
      
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(qk.tasks.all, (old) => 
          old?.map(t => t.id === taskId ? { ...t, status: completed ? "completed" : "pending" } : t)
        );
      }
      
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(qk.tasks.all, context.previousTasks);
      }
      toast({ title: "Error", description: "Failed to update task status.", variant: "destructive" });
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: qk.tasks.all });
      queryClient.invalidateQueries({ queryKey: qk.tasks.forContact(variables.contactId) });
    },
  });
}
