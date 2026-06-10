import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { ghlProxy } from "@/lib/ghlProxy";
import { toast } from "@/hooks/use-toast";
import { driveTime } from "@/lib/edgeFunctions";

export interface CalendarEvent {
  id: string;
  calendarId: string;
  contactId: string;
  startTime: string;
  endTime: string;
  title: string;
  status: string;
  notes?: string;
}

export function useCalendarEvents(range: { startTime: string; endTime: string; calendarId?: string; userId?: string; groupId?: string }) {
  return useQuery({
    queryKey: qk.calendar.events(range),
    queryFn: async () => {
      // Must provide at least one ID per API docs
      if (!range.calendarId && !range.userId && !range.groupId) {
        return [];
      }
      
      const queryParams = new URLSearchParams({
        startTime: range.startTime,
        endTime: range.endTime,
      });
      
      if (range.calendarId) queryParams.append("calendarId", range.calendarId);
      if (range.userId) queryParams.append("userId", range.userId);
      if (range.groupId) queryParams.append("groupId", range.groupId);

      const response = await ghlProxy<{ events: CalendarEvent[] }>({
        method: "GET",
        path: `/calendars/events?${queryParams.toString()}`,
      });
      
      return response.events || [];
    },
    enabled: !!(range.calendarId || range.userId || range.groupId),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<CalendarEvent>) => {
      const response = await ghlProxy<any>({
        method: "POST",
        path: "/calendars/events",
        body: data,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.calendar.events({}) });
      toast({ title: "Appointment Created", description: "The appointment has been scheduled successfully." });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CalendarEvent> }) => {
      const response = await ghlProxy<any>({
        method: "PUT",
        path: `/calendars/events/${id}`,
        body: data,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.calendar.events({}) });
      toast({ title: "Appointment Updated", description: "The appointment has been updated successfully." });
    },
  });
}

export function useDriveTime(origin: string, destination: string) {
  return useQuery({
    queryKey: ["driveTime", origin, destination],
    queryFn: () => driveTime(origin, destination),
    enabled: !!origin && !!destination,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
