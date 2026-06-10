import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DetailTabsProps {
  tabs: {
    value: string;
    label: string;
    content: ReactNode;
  }[];
  defaultValue?: string;
  className?: string;
}

export function DetailTabs({ tabs, defaultValue, className }: DetailTabsProps) {
  return (
    <Tabs defaultValue={defaultValue || tabs[0]?.value} className={cn("w-full", className)}>
      <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto">
        {tabs.map(tab => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value}
            className="rounded-none border-b-2 border-transparent px-4 py-3 font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value} className="mt-6 focus-visible:outline-none focus-visible:ring-0">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
