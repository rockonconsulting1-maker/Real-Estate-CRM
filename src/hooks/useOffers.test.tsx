import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { ghlProxy } from "@/lib/ghlProxy";
import { useOffers, RECORDS_PAGE_LIMIT } from "./useOffers";

vi.mock("@/lib/ghlProxy", () => ({ ghlProxy: vi.fn() }));

const proxy = ghlProxy as Mock;

function makeRecords(count: number, offset = 0) {
  return Array.from({ length: count }, (_, i) => ({
    id: `offer-${offset + i}`,
    properties: { status: "draft" },
    searchAfter: ["cursor", offset + i],
  }));
}

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useOffers pagination", () => {
  beforeEach(() => {
    proxy.mockReset();
  });

  it("pages with searchAfter cursors and flattens results", async () => {
    proxy
      .mockResolvedValueOnce({ records: makeRecords(RECORDS_PAGE_LIMIT) })
      .mockResolvedValueOnce({ records: makeRecords(5, RECORDS_PAGE_LIMIT) });

    const { result } = renderHook(() => useOffers(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(RECORDS_PAGE_LIMIT);
    expect(result.current.hasNextPage).toBe(true);

    // First request: required page/pageLimit, no cursor, no locationId
    const firstBody = proxy.mock.calls[0][0].body;
    expect(proxy.mock.calls[0][0].path).toBe(
      "/objects/custom_objects.real_estate_offer/records/search",
    );
    expect(firstBody.page).toBe(1);
    expect(firstBody.pageLimit).toBe(RECORDS_PAGE_LIMIT);
    expect(firstBody.searchAfter).toBeUndefined();
    expect(firstBody.locationId).toBeUndefined();

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data).toHaveLength(RECORDS_PAGE_LIMIT + 5));

    // Second request carries the last record's searchAfter as the cursor
    const secondBody = proxy.mock.calls[1][0].body;
    expect(secondBody.searchAfter).toEqual(["cursor", RECORDS_PAGE_LIMIT - 1]);

    // Short page means no further cursor
    expect(result.current.hasNextPage).toBe(false);
  });

  it("has no next page when the first page is short", async () => {
    proxy.mockResolvedValueOnce({ records: makeRecords(3) });

    const { result } = renderHook(() => useOffers(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(3);
    expect(result.current.hasNextPage).toBe(false);
  });
});
