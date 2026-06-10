import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { toast } from "sonner";

interface LogContactButtonProps {
  leadId: string;
}

export function LogContactButton({ leadId }: LogContactButtonProps) {
  const handleLog = () => {
    // In a real app, this might open a quick-log drawer
    toast.success("Contact interaction logged");
  };

  return (
    <Button 
      variant="accent-brand" 
      className="gap-2"
      onClick={handleLog}
    >
      <History className="h-4 w-4" />
      Log contact
    </Button>
  );
}
