import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { ghlProxy } from "@/lib/ghlProxy";
import { useContacts } from "./useContacts";
import { useAuth } from "@/providers/AuthProvider";

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
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useContacts", () => {
  beforeEach(() => {
    proxy.mockReset();
    mockUseAuth.mockReturnValue({ ghlLocationId: "loc-123", isLoading: false });
  });

  it("renders mapped contacts data correctly", async () => {
    proxy.mockResolvedValue({
      contacts: [
        {
          id: "contact-1",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane@example.com",
          phone: "987654321",
          type: "customer"
        }
      ]
    });

    const { result } = renderHook(() => useContacts({}), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].id).toBe("contact-1");
    expect(result.current.data![0].name).toBe("Jane Smith");
  });
});
