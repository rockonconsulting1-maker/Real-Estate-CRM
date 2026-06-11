import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { ghlProxy } from "@/lib/ghlProxy";
import { toast } from "@/hooks/use-toast";
import { Task } from "@/types";
import { mapTask } from "@/lib/ghl/tasks";
import { resolveLinkedContact } from "@/lib/ghl/associations";
import { supabase } from "@/lib/supabase";
import { startOfDay, endOfDay } from "date-fns";

export type TaskFilter = "all" | "today" | "overdue" | "upcoming" | "completed";

export function useAllTasks(filter: TaskFilter = "all") {
  return useQuery({
    queryKey: [...qk.tasks.all, filter],
    queryFn: async () => {
      let query = supabase.from('task_index').select('*');
      
      const todayStart = startOfDay(new Date()).toISOString();
      const todayEnd = endOfDay(new Date()).toISOString();

      if (filter === "completed") {
        query = query.eq('completed', true);
      } else {
        query = query.eq('completed', false);
        if (filter === "today") {
          query = query.lte('due_date', todayEnd);
        } else if (filter === "overdue") {
          query = query.lt('due_date', todayStart);
        } else if (filter === "upcoming") {
          query = query.or(`due_date.gt.${todayEnd},due_date.is.null`);
        }
      }

      const { data, error } = await query.order('due_date', { ascending: true, nullsFirst: false });
      
      if (error) throw error;
      
      return (data || []).map(t => mapTask({
        id: t.id,
        title: t.title,
        body: t.body,
        dueDate: t.due_date,
        status: t.completed ? "completed" : "pending",
        assignedTo: t.assigned_to,
        contactId: t.contact_id
      }));
    },
  });
}

export interface TasksForResult {
  tasks: Task[];
  /** True when the entity has no linked contact — show a "No linked contact" empty state. */
  isUnlinked: boolean;
  contactId: string | null;
}

export function useTasksFor(entityType: "contact" | "opportunity" | "property" | "offer", entityId: string) {
  return useQuery<TasksForResult>({
    queryKey: ["tasks", entityType, entityId],
    queryFn: async () => {
      const contactId =
        entityType === "contact"
          ? entityId
          : await resolveLinkedContact(entityType, entityId);

      if (!contactId) {
        return { tasks: [], isUnlinked: true, contactId: null };
      }

      const response = await ghlProxy<{ tasks: any[] }>({
        method: "GET",
        path: `/contacts/${contactId}/tasks`,
      });

      return {
        tasks: (response.tasks || []).map((t: any) => mapTask({ ...t, contactId })),
        isUnlinked: false,
        contactId,
      };
    },
    enabled: !!entityId,
  });
}

async function writeThroughTask(task: any, locationId: string, contactId: string) {
  const { error } = await supabase
    .from('task_index')
    .upsert({
      id: task.id,
      ghl_location_id: locationId,
      contact_id: contactId,
      title: task.title,
      body: task.body,
      due_date: task.dueDate,
      completed: task.status === 'completed',
      assigned_to: task.assignedTo,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
  if (error) console.error('Write-through failed:', error);
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

      if (response && response.id) {
        const { data: link } = await supabase
          .from('user_location_links')
          .select('ghl_location_id')
          .eq('is_primary', true)
          .maybeSingle();

        if (link?.ghl_location_id) {
          await writeThroughTask({ ...data, id: response.id }, link.ghl_location_id, contactId);
        }
      }
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

      const { data: link } = await supabase
          .from('user_location_links')
          .select('ghl_location_id')
          .eq('is_primary', true)
          .maybeSingle();
      if (link?.ghl_location_id) {
        await writeThroughTask({ ...data, id: taskId }, link.ghl_location_id, contactId);
      }

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

      const { data: link } = await supabase
          .from('user_location_links')
          .select('ghl_location_id')
          .eq('is_primary', true)
          .maybeSingle();
      if (link?.ghl_location_id) {
        await supabase.from('task_index').update({ completed }).eq('id', taskId);
      }

      return response;
    },
    onMutate: async ({ contactId, taskId, completed }) => {
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

export function useSyncTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      let cursor = null;
      let totalProcessed = 0;
      do {
        const { data, error } = await supabase.functions.invoke('backfill-tasks', {
          body: { cursor }
        });
        if (error) throw error;
        cursor = data.nextCursor;
        totalProcessed += 20;
        console.log(`Processed ~ ${totalProcessed} contacts`);
      } while (cursor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.tasks.all });
      toast({ title: "Sync Complete", description: "Your tasks have been synchronized." });
    },
  });
}
