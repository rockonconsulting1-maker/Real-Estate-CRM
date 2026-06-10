import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ConflictBannerProps {
  conflictsCount: number;
  onReschedule: () => void;
}

export function ConflictBanner({ conflictsCount, onReschedule }: ConflictBannerProps) {
  if (conflictsCount === 0) return null;

  return (
    <Alert variant="destructive" className="mb-4 bg-destructive-soft border-destructive/20 text-destructive-ink">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Schedule Conflict</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>You have {conflictsCount} overlapping appointment{conflictsCount > 1 ? 's' : ''}.</span>
        <Button variant="outline" size="sm" onClick={onReschedule} className="h-8 border-destructive/30 hover:bg-destructive/10">
          Reschedule
        </Button>
      </AlertDescription>
    </Alert>
  );
}
