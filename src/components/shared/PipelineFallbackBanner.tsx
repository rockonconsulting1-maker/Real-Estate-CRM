import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PipelineFallbackBannerProps {
  pipelineName: string;
}

export function PipelineFallbackBanner({ pipelineName }: PipelineFallbackBannerProps) {
  return (
    <Alert variant="destructive" className="mx-4 mt-4 w-auto">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Pipeline Not Found</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          Could not automatically resolve the <strong>{pipelineName}</strong> pipeline.
          Please map it manually in Settings to enable this view.
        </p>
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link to="/settings">Go to Settings</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
