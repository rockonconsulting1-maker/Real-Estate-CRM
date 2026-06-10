import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SwipeRowProps {
  children: ReactNode;
  rightAction?: ReactNode;
  leftAction?: ReactNode;
  className?: string;
}

export function SwipeRow({ children, rightAction, leftAction, className }: SwipeRowProps) {
  // A simple placeholder for swipe functionality.
  return (
    <div className={cn("relative overflow-hidden group border-b border-border bg-background", className)}>
      <div className="absolute inset-y-0 left-0 flex items-center bg-success text-success-foreground px-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {leftAction}
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center bg-destructive text-destructive-foreground px-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {rightAction}
      </div>
      <div className="relative bg-background p-4 transition-transform group-hover:translate-x-0">
        {children}
      </div>
    </div>
  );
}
