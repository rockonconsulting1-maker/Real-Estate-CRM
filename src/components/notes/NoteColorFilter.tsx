import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface NoteColorFilterProps {
  value: string | null;
  onChange: (color: string | null) => void;
}

const COLORS = [
  { id: "yellow", class: "bg-yellow-200" },
  { id: "blue", class: "bg-blue-200" },
  { id: "green", class: "bg-green-200" },
  { id: "pink", class: "bg-pink-200" },
  { id: "purple", class: "bg-purple-200" },
];

export function NoteColorFilter({ value, onChange }: NoteColorFilterProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap mb-4">
      <div className="flex w-max space-x-2 p-1">
        <Button
          variant="outline"
          size="sm"
          className={cn("rounded-full px-4 h-8", value === null && "bg-primary text-primary-foreground")}
          onClick={() => onChange(null)}
        >
          All
        </Button>
        {COLORS.map(color => (
          <Button
            key={color.id}
            variant="outline"
            size="icon"
            className={cn(
              "rounded-full w-8 h-8",
              color.class,
              value === color.id && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={() => onChange(color.id === value ? null : color.id)}
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  );
}
