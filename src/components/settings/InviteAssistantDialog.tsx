import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInviteAssistant } from "@/hooks/useSettings";
import { Loader2 } from "lucide-react";

export function InviteAssistantDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const invite = useInviteAssistant();

  const handleInvite = () => {
    if (!email) return;
    invite.mutate({ email }, {
      onSuccess: () => {
        setOpen(false);
        setEmail("");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Invite Assistant</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Assistant</DialogTitle>
          <DialogDescription>
            Send an invitation link to a new assistant.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email Address</Label>
            <Input 
              id="invite-email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="assistant@example.com"
            />
          </div>
          <Button onClick={handleInvite} className="w-full" disabled={!email || invite.isPending}>
            {invite.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Invitation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
