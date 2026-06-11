import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { ghlProxy } from "@/lib/ghlProxy";
import { useLeads } from "./useLeads";
import { useAuth } from "@/providers/AuthProvider";
import { PipelineConfigProvider } from "@/providers/PipelineConfigProvider";

vi.mock("@/lib/ghlProxy", () => ({ ghlProxy: vi.fn() }));
vi.mock("@/providers/AuthProvider", () => ({
  useAuth: vi.fn()
}));

const proxy = ghlProxy as Mock;
const mockUseAuth = useAuth as Mock;

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={client}>
      <PipelineConfigProvider>
        {children}
      </PipelineConfigProvider>
    </QueryClientProvider>
  );
}

describe("useLeads", () => {
  beforeEach(() => {
    proxy.mockReset();
    mockUseAuth.mockReturnValue({
        ghlLocationId: "loc-123",
        appUser: { pipeline_mapping: {} },
        isLoading: false
    });
  });

  it("renders mapped leads data correctly", async () => {
    // Pipeline discovery
    proxy.mockImplementation(async (req) => {
        if (req.path === '/opportunities/pipelines') {
            return {
                pipelines: [
                    { id: 'p1', name: 'Lead Nurture', stages: [{ id: 's1', name: 'New' }] },
                    { id: 'p2', name: 'Buyer', stages: [] },
                    { id: 'p3', name: 'Seller', stages: [] }
                ]
            };
        }
        if (req.path === '/contacts/search') {
            return {
                contacts: [
                    {
                        id: "contact-1",
                        firstName: "John",
                        lastName: "Doe",
                        email: "john@example.com",
                        phone: "123456789",
                        type: "lead"
                    }
                ]
            };
        }
        if (req.path === '/opportunities/search') {
            return {
                opportunities: [
                    {
                        id: "opp-1",
                        name: "Opp 1",
                        pipelineId: "p1",
                        pipelineStageId: "s1",
                        status: "open",
                        monetaryValue: 1000,
                        contactId: "contact-1"
                    }
                ]
            };
        }
        return { error: 'Unexpected path' };
    });

    const { result } = renderHook(() => useLeads({}), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 15000 });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].id).toBe("contact-1");
  }, 20000);
});
