import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContextFAB } from "@/components/layout/ContextFAB";
import { Plus, CheckCircle2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAllTasks, TaskFilter as FilterType } from "@/hooks/useTasks";
import { TaskRow } from "@/components/tasks/TaskRow";
import { TaskFilterTabs, TaskFilter, TaskGroupHeader } from "@/components/tasks/TaskFilterTabs";
import { AddTaskDrawer } from "@/components/tasks/AddTaskDrawer";
import { TaskInlineEditor } from "@/components/tasks/TaskInlineEditor";
import { TaskSchedulerMiniCalendar } from "@/components/tasks/TaskSchedulerMiniCalendar";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { Task } from "@/types";

export default function Tasks() {
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState<TaskFilter>(isMobile ? "today" : "all");
  const { data: tasks, isLoading } = useAllTasks(filter as FilterType);

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // For counts, we still might want a separate query or just use the current data if it was "all"
  // But let's keep it simple and just show the list for now, or fetch "all" once for counts.
  // Actually, existing UI expects counts. We'll stick to client-side filtering for counts if we had all tasks,
  // but the requirement said filter in SQL. So counts might be slightly off if we only fetch one slice.
  // To keep UI consistent, we'll fetch 'all' and filter client-side for the counts, but the main list uses the filtered query.
  // Wait, if I fetch 'all', I have everything.
  // The requirement: "Rewrite useAllTasks to query task_index directly... with filters... computed in SQL".

  const { data: allTasksForCounts } = useAllTasks("all");

  const counts = useMemo(() => {
    if (!allTasksForCounts) return undefined;
    
    // This is slightly redundant but ensures counts are always accurate across tabs
    return {
      all: allTasksForCounts.length,
      today: allTasksForCounts.filter(t => t.status !== "completed" && t.dueDate && (new Date(t.dueDate) <= new Date())).length,
      overdue: allTasksForCounts.filter(t => t.status !== "completed" && t.dueDate && (new Date(t.dueDate) < new Date())).length,
      upcoming: allTasksForCounts.filter(t => t.status !== "completed" && (!t.dueDate || new Date(t.dueDate) > new Date())).length,
      completed: allTasksForCounts.filter(t => t.status === "completed").length,
    };
  }, [allTasksForCounts]);

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
            ) : !tasks || tasks.length === 0 ? (
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
                <TaskGroupHeader title={`${filter} Tasks`} count={tasks.length} />
                {tasks.map(task => (
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
