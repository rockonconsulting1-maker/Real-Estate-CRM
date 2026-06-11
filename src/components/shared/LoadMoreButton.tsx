import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadMoreButtonProps {
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  onClick: () => void;
}

export function LoadMoreButton({ hasNextPage, isFetchingNextPage, onClick }: LoadMoreButtonProps) {
  if (!hasNextPage) return null;

  return (
    <div className="flex justify-center py-4">
      <Button variant="outline" onClick={onClick} disabled={isFetchingNextPage} className="gap-2">
        {isFetchingNextPage && <Loader2 className="w-4 h-4 animate-spin" />}
        {isFetchingNextPage ? "Loading…" : "Load more"}
      </Button>
    </div>
  );
}
