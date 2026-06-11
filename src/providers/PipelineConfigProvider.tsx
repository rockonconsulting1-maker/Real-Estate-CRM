import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ghlProxy } from '@/lib/ghlProxy';
import { useAuth } from './AuthProvider';

interface PipelineStage {
  id: string;
  name: string;
  position: number;
}

interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
}

interface PipelineConfigContextType {
  leadPipeline?: Pipeline;
  buyerPipeline?: Pipeline;
  sellerPipeline?: Pipeline;
  stagesById: Record<string, PipelineStage>;
  isLoading: boolean;
  isPipelinesLoading: boolean;
  isResolved: boolean;
  error: Error | null;
  refetch: () => void;
}

const PipelineConfigContext = createContext<PipelineConfigContextType | undefined>(undefined);

export function PipelineConfigProvider({ children }: { children: React.ReactNode }) {
  const { ghlLocationId, appUser, isLoading: isAuthLoading } = useAuth();

  const { data: pipelines, isLoading: isPipelinesLoading, error, refetch } = useQuery({
    queryKey: ['ghl', 'pipelines', ghlLocationId],
    queryFn: async () => {
      const response = await ghlProxy<{ pipelines: Pipeline[] }>({
        method: 'GET',
        path: '/opportunities/pipelines',
      });
      return response.pipelines;
    },
    enabled: !!ghlLocationId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const resolved = useMemo(() => {
    if (!pipelines) return { stagesById: {}, isResolved: false };

    const mapping = appUser?.pipeline_mapping || {};

    const findPipeline = (defaultName: string, mappingKey: string) => {
      // 1. Check manual mapping
      if (mapping[mappingKey]) {
        const found = pipelines.find(p => p.id === mapping[mappingKey]);
        if (found) return found;
      }

      // 2. Name matching
      return pipelines.find(p =>
        p.name.toLowerCase().includes(defaultName.toLowerCase())
      );
    };

    const leadPipeline = findPipeline('Lead Nurture', 'leads');
    const buyerPipeline = findPipeline('Buyer', 'buyer');
    const sellerPipeline = findPipeline('Seller', 'seller');

    const stagesById: Record<string, PipelineStage> = {};
    [leadPipeline, buyerPipeline, sellerPipeline].forEach(p => {
      p?.stages.forEach(s => {
        stagesById[s.id] = s;
      });
    });

    return {
      leadPipeline,
      buyerPipeline,
      sellerPipeline,
      stagesById,
      isResolved: !!(leadPipeline && buyerPipeline && sellerPipeline)
    };
  }, [pipelines, appUser?.pipeline_mapping]);

  const value = {
    ...resolved,
    isLoading: isAuthLoading || isPipelinesLoading,
    isPipelinesLoading,
    error: error as Error | null,
    refetch,
  };

  return (
    <PipelineConfigContext.Provider value={value}>
      {children}
    </PipelineConfigContext.Provider>
  );
}

export function usePipelines() {
  const context = useContext(PipelineConfigContext);
  if (context === undefined) {
    throw new Error('usePipelines must be used within a PipelineConfigProvider');
  }
  return context;
}
