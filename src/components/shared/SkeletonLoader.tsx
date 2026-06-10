import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  variant: "card" | "list-row" | "kanban-column" | "stat";
  count?: number;
  className?: string;
}

export function SkeletonLoader({ variant, count = 1, className }: SkeletonLoaderProps) {
  const items = Array.from({ length: count });

  const renderSkeleton = () => {
    if (variant === "card") {
      return (
        <div className={cn("flex flex-col space-y-3 p-4 border border-border rounded-lg bg-card", className)}>
          <Skeleton className="h-[125px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      );
    }

    if (variant === "list-row") {
      return (
        <div className={cn("flex items-center space-x-4 p-4 border-b border-border", className)}>
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      );
    }

    if (variant === "kanban-column") {
      return (
        <div className={cn("flex flex-col space-y-4 w-[300px] bg-background-sunk p-4 rounded-lg", className)}>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }

    if (variant === "stat") {
      return (
        <div className={cn("p-6 border border-border rounded-lg bg-card", className)}>
          <Skeleton className="h-4 w-[100px] mb-4" />
          <Skeleton className="h-8 w-[150px]" />
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {items.map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </>
  );
}
