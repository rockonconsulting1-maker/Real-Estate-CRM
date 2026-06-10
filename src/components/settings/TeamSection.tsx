import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTeam, useRevokeAssistant, useUpdateTemplate } from "@/hooks/useSettings";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { InviteAssistantDialog } from "./InviteAssistantDialog";

const TEMPLATES = [
  { value: "read_only", label: "Read Only" },
  { value: "leads_calendar", label: "Leads & Calendar" },
  { value: "full_except_settings", label: "Full (except Settings)" },
];

export function TeamSection() {
  const { data: team, isLoading } = useTeam();
  const revoke = useRevokeAssistant();
  const updateTemplate = useUpdateTemplate();
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Team</CardTitle>
          <CardDescription>Manage assistants and their permissions.</CardDescription>
        </div>
        <InviteAssistantDialog />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <SkeletonLoader variant="list-row" count={2} />
        ) : team?.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground border rounded-lg bg-muted/20">
            No assistants found. Invite one to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {team?.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div>
                  <div className="font-medium">{member.app_users?.full_name || member.app_users?.email}</div>
                  <div className="text-sm text-muted-foreground">{member.app_users?.email}</div>
                  <div className="mt-2 flex items-center gap-2">
                    {member.revoked_at ? (
                      <Badge variant="destructive">Revoked</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Joined {format(new Date(member.app_users?.created_at || Date.now()), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Select 
                    value={member.permission_template} 
                    onValueChange={(val) => updateTemplate.mutate({ assistantUserId: member.app_user_id, template: val })}
                    disabled={!!member.revoked_at || updateTemplate.isPending}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {!member.revoked_at && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => revoke.mutate({ assistantUserId: member.app_user_id })}
                      disabled={revoke.isPending}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
