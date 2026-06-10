import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContextFAB } from "@/components/layout/ContextFAB";
import { Plus, CheckCircle2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAllTasks } from "@/hooks/useTasks";
import { TaskRow } from "@/components/tasks/TaskRow";
import { TaskFilterTabs, TaskFilter, TaskGroupHeader } from "@/components/tasks/TaskFilterTabs";
import { AddTaskDrawer } from "@/components/tasks/AddTaskDrawer";
import { TaskInlineEditor } from "@/components/tasks/TaskInlineEditor";
import { TaskSchedulerMiniCalendar } from "@/components/tasks/TaskSchedulerMiniCalendar";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { isToday, isPast, isFuture } from "date-fns";
import { Task } from "@/types";

export default function Tasks() {
  const isMobile = useIsMobile();
  const { data: tasks, isLoading } = useAllTasks();
  
  const [filter, setFilter] = useState<TaskFilter>(isMobile ? "today" : "all");
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      const isCompleted = task.status === "completed";
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      
      if (filter === "completed") return isCompleted;
      if (isCompleted) return false; // Hide completed from other views unless specifically requested
      
      if (filter === "all") return true;
      
      if (filter === "today") {
        return dueDate && (isToday(dueDate) || isPast(dueDate)); // Include overdue in today for mobile default
      }
      
      if (filter === "overdue") {
        return dueDate && isPast(dueDate) && !isToday(dueDate);
      }
      
      if (filter === "upcoming") {
        return !dueDate || (isFuture(dueDate) && !isToday(dueDate));
      }
      
      return true;
    });
  }, [tasks, filter]);

  // Calculate counts for tabs
  const counts = useMemo(() => {
    if (!tasks) return undefined;
    
    return {
      all: tasks.filter(t => t.status !== "completed").length,
      today: tasks.filter(t => t.status !== "completed" && t.dueDate && (isToday(new Date(t.dueDate)) || isPast(new Date(t.dueDate)))).length,
      overdue: tasks.filter(t => t.status !== "completed" && t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))).length,
      upcoming: tasks.filter(t => t.status !== "completed" && (!t.dueDate || (isFuture(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))))).length,
      completed: tasks.filter(t => t.status === "completed").length,
    };
  }, [tasks]);

  return (
    <div className="flex flex-col h-full bg-background">
      <PageHeader title="Tasks" />
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left/Main Panel - Task List */}
        <div className="flex-1 flex flex-col min-w-0 border-r">
          <div className="border-b">
            <TaskFilterTabs value={filter} onChange={setFilter} counts={counts} />
          </div>
          
          <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {isLoading ? (
              <div className="p-4 space-y-4">
                <SkeletonLoader variant="list-row" />
                <SkeletonLoader variant="list-row" />
                <SkeletonLoader variant="list-row" />
              </div>
            ) : filteredTasks.length === 0 ? (
              <EmptyState 
                title="No tasks found" 
                description={`You don't have any ${filter} tasks.`} 
                icon={<CheckCircle2 className="h-12 w-12 text-muted-foreground/50" />}
                action={
                  <Button onClick={() => setIsAddDrawerOpen(true)}>
                    Add Task
                  </Button>
                }
              />
            ) : (
              <div className="flex flex-col">
                <TaskGroupHeader title={`${filter} Tasks`} count={filteredTasks.length} />
                {filteredTasks.map(task => (
                  <TaskRow 
                    key={task.id} 
                    task={task} 
                    onClick={() => setSelectedTask(task)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Right Panel - Desktop Only */}
        {!isMobile && (
          <div className="w-[400px] flex-shrink-0 flex flex-col bg-muted/10 p-4 gap-4 overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg">Task Management</h2>
              <Button size="sm" onClick={() => setIsAddDrawerOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
            
            <TaskSchedulerMiniCalendar />
            
            <div className="flex-1 mt-4">
              <TaskInlineEditor task={selectedTask} onClose={() => setSelectedTask(null)} />
            </div>
          </div>
        )}
      </div>
      
      {isMobile && (
        <ContextFAB 
          icon={<Plus className="h-6 w-6" />}
          onClick={() => setIsAddDrawerOpen(true)}
        />
      )}
      
      <AddTaskDrawer 
        open={isAddDrawerOpen} 
        onOpenChange={setIsAddDrawerOpen} 
      />
    </div>
  );
}
