import { useState, useEffect } from "react";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateTask, useCompleteTask } from "@/hooks/useTasks";
import { format } from "date-fns";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskInlineEditorProps {
  task: Task | null;
  onClose?: () => void;
}

export function TaskInlineEditor({ task, onClose }: TaskInlineEditorProps) {
  const updateMutation = useUpdateTask();
  const completeMutation = useCompleteTask();
  
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDueDate(task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "");
    }
  }, [task]);

  if (!task) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
        <p>Select a task to view or edit details</p>
      </div>
    );
  }

  const isCompleted = task.status === "completed";

  const handleSave = () => {
    if (!task.contactId) return;
    updateMutation.mutate({
      contactId: task.contactId,
      taskId: task.id,
      data: {
        title,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      }
    });
  };

  const handleToggleComplete = () => {
    if (!task.contactId) return;
    completeMutation.mutate({
      contactId: task.contactId,
      taskId: task.id,
      completed: !isCompleted,
    });
  };

  return (
    <div className="flex flex-col h-full bg-card border rounded-lg overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between bg-muted/30">
        <h3 className="font-semibold text-lg">Task Details</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        )}
      </div>
      
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="flex items-start gap-4">
          <button 
            className="mt-1 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            onClick={handleToggleComplete}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-6 w-6 text-success" />
            ) : (
              <Circle className="h-6 w-6" />
            )}
          </button>
          
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input 
                id="edit-title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className={cn(isCompleted && "line-through text-muted-foreground")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-due-date">Due Date</Label>
              <Input 
                id="edit-due-date" 
                type="date"
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label>Contact ID</Label>
              <div className="p-2 bg-muted rounded-md text-sm font-mono text-muted-foreground">
                {task.contactId || "None"}
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={handleSave} 
                disabled={updateMutation.isPending || (title === task.title && (dueDate === (task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "")))}
                className="w-full"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
