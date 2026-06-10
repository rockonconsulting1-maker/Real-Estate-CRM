import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateTask } from "@/hooks/useTasks";
import { useIsMobile } from "@/hooks/use-mobile";

interface AddTaskDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId?: string; // Pre-filled contact ID
}

export function AddTaskDrawer({ open, onOpenChange, contactId }: AddTaskDrawerProps) {
  const isMobile = useIsMobile();
  const createMutation = useCreateTask();
  
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedContactId, setSelectedContactId] = useState(contactId || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedContactId) return;
    
    createMutation.mutate(
      {
        contactId: selectedContactId,
        data: {
          title,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          status: "pending",
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setTitle("");
          setDueDate("");
          setNotes("");
          if (!contactId) setSelectedContactId("");
        },
      }
    );
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4 px-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title</Label>
        <Input 
          id="title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Call to follow up..."
          required
        />
      </div>
      
      {!contactId && (
        <div className="space-y-2">
          <Label htmlFor="contactId">Contact ID</Label>
          <Input 
            id="contactId" 
            value={selectedContactId} 
            onChange={(e) => setSelectedContactId(e.target.value)} 
            placeholder="Enter contact ID..."
            required
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input 
          id="dueDate" 
          type="date"
          value={dueDate} 
          onChange={(e) => setDueDate(e.target.value)} 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea 
          id="notes" 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          placeholder="Add any additional details here..."
          rows={3}
        />
      </div>
    </form>
  );

  const footer = (
    <div className="flex gap-2 w-full pt-4">
      <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
        Cancel
      </Button>
      <Button type="submit" className="flex-1" onClick={handleSubmit} disabled={!title || !selectedContactId || createMutation.isPending}>
        {createMutation.isPending ? "Creating..." : "Create Task"}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add Task</DrawerTitle>
          </DrawerHeader>
          {content}
          <DrawerFooter>{footer}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Task</SheetTitle>
        </SheetHeader>
        <div className="py-4">{content}</div>
        <SheetFooter>{footer}</SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
