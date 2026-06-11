import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ghlProxy } from '@/lib/ghlProxy';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { usePipelines } from '@/providers/PipelineConfigProvider';

export function PipelineMappingSection() {
  const { appUser, ghlLocationId } = useAuth();
  const queryClient = useQueryClient();
  const { refetch: refetchPipelines } = usePipelines();

  const [mapping, setMapping] = useState<Record<string, string>>(
    appUser?.pipeline_mapping || { leads: '', buyer: '', seller: '' }
  );

  const { data: pipelines } = useQuery({
    queryKey: ['ghl', 'pipelines', ghlLocationId],
    queryFn: async () => {
      const response = await ghlProxy<{ pipelines: any[] }>({
        method: 'GET',
        path: '/opportunities/pipelines',
      });
      return response.pipelines;
    },
    enabled: !!ghlLocationId,
  });

  const mutation = useMutation({
    mutationFn: async (newMapping: Record<string, string>) => {
      const { error } = await supabase
        .from('app_users')
        .update({ pipeline_mapping: newMapping })
        .eq('id', appUser?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Pipeline mapping updated');
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] }); // Hypothetical auth user key
      // The appUser in AuthProvider is updated on onAuthStateChange or manual refresh
      // Since we don't have a direct way to trigger AuthProvider refresh here without a proper hook,
      // we'll assume the user will see changes on next load or we trigger a refetch if available.
      refetchPipelines();
      window.location.reload(); // Simple way to ensure AuthProvider and PipelineProvider are in sync
    },
    onError: (err) => {
      toast.error('Failed to update mapping: ' + err.message);
    },
  });

  const handleSave = () => {
    mutation.mutate(mapping);
  };

  const updateMapping = (key: string, value: string) => {
    setMapping(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Mapping</CardTitle>
        <CardDescription>
          Manually map GHL pipelines to CRM roles if automatic detection fails.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="leads-pipeline">Leads Pipeline (Lead Nurture)</Label>
          <Select
            value={mapping.leads}
            onValueChange={(v) => updateMapping('leads', v)}
          >
            <SelectTrigger id="leads-pipeline">
              <SelectValue placeholder="Select pipeline..." />
            </SelectTrigger>
            <SelectContent>
              {pipelines?.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="buyer-pipeline">Buyer Clients Pipeline</Label>
          <Select
            value={mapping.buyer}
            onValueChange={(v) => updateMapping('buyer', v)}
          >
            <SelectTrigger id="buyer-pipeline">
              <SelectValue placeholder="Select pipeline..." />
            </SelectTrigger>
            <SelectContent>
              {pipelines?.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="seller-pipeline">Seller Clients Pipeline</Label>
          <Select
            value={mapping.seller}
            onValueChange={(v) => updateMapping('seller', v)}
          >
            <SelectTrigger id="seller-pipeline">
              <SelectValue placeholder="Select pipeline..." />
            </SelectTrigger>
            <SelectContent>
              {pipelines?.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSave} disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Save Mapping'}
        </Button>
      </CardContent>
    </Card>
  );
}
