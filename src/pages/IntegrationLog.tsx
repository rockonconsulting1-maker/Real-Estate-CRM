import { PageHeader } from "@/components/layout/PageHeader";
import { useAuditLog } from "@/hooks/useSettings";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { Navigate } from "react-router-dom";

export default function IntegrationLog() {
  const { role } = useAuth();
  const { data: logs, isLoading } = useAuditLog();

  if (role !== "agent") {
    return <Navigate to="/settings" replace />;
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader 
        title="Integration Test Log" 
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to="/settings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Settings
            </Link>
          </Button>
        }
      />
      <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-4">
                      <SkeletonLoader variant="list-row" count={5} />
                    </TableCell>
                  </TableRow>
                ) : logs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No integration logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {log.method || "UNKNOWN"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate font-mono text-xs" title={log.path}>
                        {log.path || "-"}
                      </TableCell>
                      <TableCell>
                        {log.status_code ? (
                          <Badge 
                            variant={log.status_code >= 400 ? "destructive" : "secondary"}
                            className={log.status_code < 400 ? "bg-success/10 text-success hover:bg-success/20" : ""}
                          >
                            {log.status_code}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="truncate max-w-[200px]" title={log.action}>
                        {log.action}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
