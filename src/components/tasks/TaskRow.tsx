import { Task } from "@/types";
import { SwipeRow } from "@/components/shared/SwipeRow";
import { CheckCircle2, Circle, Calendar, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import { useCompleteTask } from "@/hooks/useTasks";

interface TaskRowProps {
  task: Task;
  onClick?: () => void;
  onDelete?: () => void;
  onReschedule?: () => void;
}

export function TaskRow({ task, onClick, onDelete, onReschedule }: TaskRowProps) {
  const completeMutation = useCompleteTask();
  const isCompleted = task.status === "completed";
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && !isCompleted;

  const handleComplete = () => {
    if (!task.contactId) return;
    completeMutation.mutate({ 
      contactId: task.contactId, 
      taskId: task.id, 
      completed: !isCompleted 
    });
  };

  return (
    <SwipeRow
      leftAction={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white" onClick={onReschedule}>
            <Calendar className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white" onClick={onDelete}>
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      }
      rightAction={
        <Button variant="ghost" size="icon" className="text-white" onClick={handleComplete}>
          <CheckCircle2 className="h-5 w-5" />
        </Button>
      }
    >
      <div 
        className={cn(
          "flex items-start p-4 gap-3 bg-card border-b hover:bg-muted/50 cursor-pointer transition-colors",
          isCompleted && "opacity-60"
        )}
        onClick={onClick}
      >
        <button 
          className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleComplete();
          }}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium line-clamp-1",
            isCompleted && "line-through text-muted-foreground"
          )}>
            {task.title}
          </p>
          
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            {task.dueDate && (
              <span className={cn(
                "flex items-center gap-1",
                isOverdue && "text-destructive font-medium"
              )}>
                <Clock className="h-3.5 w-3.5" />
                {format(new Date(task.dueDate), "MMM d, yyyy")}
              </span>
            )}
            
            {task.contactId && (
              <span className="truncate flex-1">
                Contact: {task.contactId.substring(0, 8)}...
              </span>
            )}
          </div>
        </div>
      </div>
    </SwipeRow>
  );
}
