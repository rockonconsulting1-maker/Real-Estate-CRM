import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Link as LinkIcon, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useSyncTasks } from "@/hooks/useTasks";

export function IntegrationSection() {
  const { ghlLocationId } = useAuth();
  const syncTasks = useSyncTasks();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integration</CardTitle>
        <CardDescription>Manage your GoHighLevel connection.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <LinkIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="font-medium">GoHighLevel</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                Location ID: {ghlLocationId || "Not connected"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {ghlLocationId ? (
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                Disconnected
              </Badge>
            )}
            <Button variant="outline" asChild>
              <Link to="/connect-ghl">Reconnect</Link>
            </Button>
          </div>
        </div>

        <div className="p-4 border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Sync Data</div>
              <div className="text-sm text-muted-foreground">
                Import your tasks from GoHighLevel into the local cache.
              </div>
            </div>
            <Button
              onClick={() => syncTasks.mutate()}
              disabled={syncTasks.isPending || !ghlLocationId}
              variant="secondary"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${syncTasks.isPending ? 'animate-spin' : ''}`} />
              {syncTasks.isPending ? 'Syncing...' : 'Sync tasks'}
            </Button>
          </div>
        </div>
        
        <div>
          <Button variant="link" asChild className="px-0 text-muted-foreground hover:text-foreground">
            <Link to="/settings/integration/log">View Integration Test Log &rarr;</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
