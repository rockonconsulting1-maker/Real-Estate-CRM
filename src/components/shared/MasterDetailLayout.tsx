import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MasterDetailLayoutProps {
  master: ReactNode;
  detail: ReactNode;
  isDetailOpen?: boolean;
  onDetailClose?: () => void;
  className?: string;
}

export function MasterDetailLayout({ master, detail, isDetailOpen, onDetailClose, className }: MasterDetailLayoutProps) {
  return (
    <div className={cn("flex h-full w-full overflow-hidden relative", className)}>
      {/* Master View */}
      <div 
        className={cn(
          "flex-1 overflow-y-auto transition-all duration-300 ease-in-out border-r border-border h-full",
          isDetailOpen ? "hidden md:block md:w-1/3 md:flex-none lg:w-1/4" : "w-full"
        )}
      >
        {master}
      </div>

      {/* Detail View */}
      <div 
        className={cn(
          "h-full overflow-y-auto bg-background transition-all duration-300 ease-in-out absolute inset-0 md:relative md:inset-auto md:flex-1",
          isDetailOpen ? "translate-x-0" : "translate-x-full md:translate-x-0 md:hidden"
        )}
      >
        {detail}
      </div>
    </div>
  );
}
