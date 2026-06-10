import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TaskDropTargetProps {
  children: ReactNode;
  onDrop: (taskId: string) => void;
  className?: string;
}

export function TaskDropTarget({ children, onDrop, className }: TaskDropTargetProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onDrop(taskId);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn("h-full w-full", className)}
    >
      {children}
    </div>
  );
}
