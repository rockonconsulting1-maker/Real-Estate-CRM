import { ScrollableTabBar } from "@/components/shared/ScrollableTabBar";

export type TaskFilter = "all" | "today" | "overdue" | "upcoming" | "completed";

interface TaskFilterTabsProps {
  value: TaskFilter;
  onChange: (value: TaskFilter) => void;
  counts?: Record<TaskFilter, number>;
}

export function TaskFilterTabs({ value, onChange, counts }: TaskFilterTabsProps) {
  const tabs = [
    { value: "today", label: `Today${counts?.today ? ` (${counts.today})` : ""}` },
    { value: "overdue", label: `Overdue${counts?.overdue ? ` (${counts.overdue})` : ""}` },
    { value: "upcoming", label: `Upcoming${counts?.upcoming ? ` (${counts.upcoming})` : ""}` },
    { value: "all", label: `All${counts?.all ? ` (${counts.all})` : ""}` },
    { value: "completed", label: `Completed${counts?.completed ? ` (${counts.completed})` : ""}` },
  ];

  return (
    <ScrollableTabBar
      tabs={tabs}
      activeTab={value}
      onChange={(id) => onChange(id as TaskFilter)}
    />
  );
}

export function TaskGroupHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-y sticky top-0 z-10 backdrop-blur-sm">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      {count !== undefined && (
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}
