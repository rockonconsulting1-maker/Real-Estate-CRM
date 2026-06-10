import { cn } from "@/lib/utils";

interface AZScrubberProps {
  onSelect: (letter: string) => void;
  className?: string;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function AZScrubber({ onSelect, className }: AZScrubberProps) {
  return (
    <div className={cn("flex flex-col items-center justify-between text-[10px] font-medium text-muted-foreground w-6 py-2 h-full", className)}>
      {LETTERS.map(letter => (
        <button
          key={letter}
          onClick={() => onSelect(letter)}
          className="hover:text-primary transition-colors flex-1 w-full flex items-center justify-center"
        >
          {letter}
        </button>
      ))}
    </div>
  );
}
