import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { PipelineConfigProvider, usePipelines } from '../PipelineConfigProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ghlProxy } from '@/lib/ghlProxy';
import { useAuth } from '../AuthProvider';
import React from 'react';

// Mock ghlProxy and useAuth
vi.mock('@/lib/ghlProxy', () => ({
  ghlProxy: vi.fn(),
}));

vi.mock('../AuthProvider', () => ({
  useAuth: vi.fn(),
}));

const mockPipelines = [
  {
    id: 'p1',
    name: 'Lead Nurture',
    stages: [{ id: 's1', name: 'New Lead', position: 0 }],
  },
  {
    id: 'p2',
    name: 'Buyer Transaction',
    stages: [{ id: 's2', name: 'Showing', position: 0 }],
  },
  {
    id: 'p3',
    name: 'Seller Transaction',
    stages: [{ id: 's3', name: 'Pre-Listing', position: 0 }],
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <PipelineConfigProvider>{children}</PipelineConfigProvider>
    </QueryClientProvider>
  );
};

describe('PipelineConfigProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves pipelines by default name matching', async () => {
    (useAuth as any).mockReturnValue({
      ghlLocationId: 'loc1',
      appUser: { pipeline_mapping: {} },
      isLoading: false,
    });
    (ghlProxy as any).mockResolvedValue({ pipelines: mockPipelines });

    const { result } = renderHook(() => usePipelines(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isResolved).toBe(true), { timeout: 3000 });

    expect(result.current.leadPipeline?.id).toBe('p1');
    expect(result.current.buyerPipeline?.id).toBe('p2');
    expect(result.current.sellerPipeline?.id).toBe('p3');
  });

  it('resolves pipelines using manual mapping overrides', async () => {
    (useAuth as any).mockReturnValue({
      ghlLocationId: 'loc1',
      appUser: {
        pipeline_mapping: {
          leads: 'p1_custom',
          buyer: 'p2_custom',
          seller: 'p3_custom'
        }
      },
      isLoading: false,
    });

    const customPipelines = [
      ...mockPipelines,
      { id: 'p1_custom', name: 'Custom Leads', stages: [] },
      { id: 'p2_custom', name: 'Custom Buyer', stages: [] },
      { id: 'p3_custom', name: 'Custom Seller', stages: [] },
    ];
    (ghlProxy as any).mockResolvedValue({ pipelines: customPipelines });

    const { result } = renderHook(() => usePipelines(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isResolved).toBe(true), { timeout: 3000 });

    expect(result.current.leadPipeline?.id).toBe('p1_custom');
    expect(result.current.buyerPipeline?.id).toBe('p2_custom');
    expect(result.current.sellerPipeline?.id).toBe('p3_custom');
  });

  it('isResolved is false if a pipeline cannot be matched', async () => {
    (useAuth as any).mockReturnValue({
      ghlLocationId: 'loc1',
      appUser: { pipeline_mapping: {} },
      isLoading: false,
    });
    // Missing Seller pipeline (mockPipelines[2])
    (ghlProxy as any).mockResolvedValue({ pipelines: [mockPipelines[0], mockPipelines[1]] });

    const { result } = renderHook(() => usePipelines(), { wrapper: createWrapper() });

    // isResolved should be false because Seller is missing
    await waitFor(() => expect(result.current.isPipelinesLoading).toBeFalsy(), { timeout: 3000 });

    expect(result.current.isResolved).toBe(false);
    expect(result.current.leadPipeline).toBeDefined();
    expect(result.current.buyerPipeline).toBeDefined();
    expect(result.current.sellerPipeline).toBeUndefined();
  });
});
