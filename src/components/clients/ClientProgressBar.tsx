import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  label: string;
  status: 'complete' | 'current' | 'upcoming';
}

interface ClientProgressBarProps {
  steps: Step[];
  className?: string;
}

export function ClientProgressBar({ steps, className }: ClientProgressBarProps) {
  return (
    <div className={cn("w-full py-4 px-2", className)}>
      <div className="relative flex justify-between">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />
        
        {steps.map((step, index) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center group">
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                step.status === 'complete' ? "bg-success border-success text-success-foreground" :
                step.status === 'current' ? "bg-background border-accent-brand text-accent-brand ring-4 ring-accent-brand-soft" :
                "bg-background border-border text-muted-foreground"
              )}
            >
              {step.status === 'complete' ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-xs font-bold">{index + 1}</span>
              )}
            </div>
            <span 
              className={cn(
                "absolute -bottom-6 text-[10px] font-medium whitespace-nowrap transition-colors",
                step.status === 'current' ? "text-accent-brand font-bold" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
