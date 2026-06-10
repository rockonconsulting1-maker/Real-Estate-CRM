import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/forms/FormField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAppointment } from "@/hooks/useCalendar";

interface AddAppointmentDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
}

export function AddAppointmentDrawer({ isOpen, onOpenChange, defaultDate }: AddAppointmentDrawerProps) {
  const createAppointment = useCreateAppointment();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate ? defaultDate.toISOString().split('T')[0] : "");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date and time
    const startTime = new Date(`${date}T${time}:00`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration default

    createAppointment.mutate({
      title,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      notes,
      calendarId: "default", // would come from settings or selection
      status: "confirmed"
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setTitle("");
        setDate("");
        setTime("");
        setNotes("");
      }
    });
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Add Appointment</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <FormField label="Title">
              <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Meeting with Client" />
            </FormField>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Date">
                <Input required type="date" value={date} onChange={e => setDate(e.target.value)} />
              </FormField>
              <FormField label="Time">
                <Input required type="time" value={time} onChange={e => setTime(e.target.value)} />
              </FormField>
            </div>

            <FormField label="Notes">
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Agenda..." className="resize-none" />
            </FormField>

            <Button type="submit" className="w-full" disabled={createAppointment.isPending}>
              {createAppointment.isPending ? "Saving..." : "Schedule Appointment"}
            </Button>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
