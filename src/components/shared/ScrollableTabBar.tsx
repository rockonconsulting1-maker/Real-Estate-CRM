import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ScrollableTabBarProps {
  tabs: { label: string; value: string }[];
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ScrollableTabBar({ tabs, activeTab, onChange, className }: ScrollableTabBarProps) {
  return (
    <ScrollArea className={cn("w-full border-b border-border", className)}>
      <div className="flex w-max space-x-6 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              "relative pb-3 pt-2 text-sm font-medium transition-colors hover:text-foreground",
              activeTab === tab.value ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {tab.label}
            {activeTab === tab.value && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  );
}
