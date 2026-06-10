import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronDown, Star } from "lucide-react";

interface SavedView {
  id: string;
  name: string;
  isPinned?: boolean;
}

interface SavedViewDropdownProps {
  scope: string;
  className?: string;
}

export function SavedViewDropdown({ scope, className }: SavedViewDropdownProps) {
  // Mock views for now
  const views: SavedView[] = [
    { id: "all", name: `All ${scope.charAt(0).toUpperCase() + scope.slice(1)}` },
    { id: "hot", name: "Hot Leads", isPinned: true },
    { id: "recent", name: "Recently Added" },
  ];

  return (
    <Select defaultValue="all">
      <SelectTrigger className={cn("w-auto border-none bg-transparent shadow-none focus:ring-0 text-sm font-semibold h-auto p-0 gap-2", className)}>
        <SelectValue placeholder="Select view" />
      </SelectTrigger>
      <SelectContent align="end">
        {views.map(view => (
          <SelectItem key={view.id} value={view.id}>
            <div className="flex items-center gap-2">
              {view.name}
              {view.isPinned && <Star className="h-3 w-3 fill-warning text-warning" />}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
