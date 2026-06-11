import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { ghlProxy, ProxyError } from "./ghlProxy";
import { supabase } from "./supabase";

vi.mock("./supabase", () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));

const invoke = supabase.functions.invoke as Mock;

function httpError(status: number, body: unknown) {
  return new FunctionsHttpError(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

async function expectProxyError(promise: Promise<unknown>): Promise<ProxyError> {
  try {
    await promise;
  } catch (e) {
    expect(e).toBeInstanceOf(ProxyError);
    return e as ProxyError;
  }
  throw new Error("expected ghlProxy to throw");
}

describe("ghlProxy", () => {
  beforeEach(() => {
    invoke.mockReset();
  });

  it("returns data on success", async () => {
    invoke.mockResolvedValue({ data: { contacts: [{ id: "c1" }] }, error: null });
    const res = await ghlProxy<{ contacts: { id: string }[] }>({
      method: "POST",
      path: "/contacts/search",
      body: { page: 1, pageLimit: 20 },
    });
    expect(res.contacts[0].id).toBe("c1");
    expect(invoke).toHaveBeenCalledWith("ghl-proxy", {
      body: { method: "POST", path: "/contacts/search", body: { page: 1, pageLimit: 20 } },
    });
  });

  it.each([
    [401, "unauthorized"],
    [403, "forbidden"],
    [404, "not_found"],
    [409, "conflict"],
    [422, "bad_request"],
    [500, "server"],
    [502, "server"],
  ])("maps statusCode %i from the response body to kind %s", async (status, kind) => {
    invoke.mockResolvedValue({
      data: null,
      error: httpError(status, { error: `upstream says ${status}`, statusCode: status }),
    });

    const err = await expectProxyError(ghlProxy({ method: "GET", path: "/contacts/x" }));
    expect(err.status).toBe(status);
    expect(err.kind).toBe(kind);
    expect(err.message).toBe(`upstream says ${status}`);
  });

  it("falls back to the Response status when the body is not JSON", async () => {
    invoke.mockResolvedValue({
      data: null,
      error: new FunctionsHttpError(new Response("not json", { status: 404 })),
    });

    const err = await expectProxyError(ghlProxy({ method: "GET", path: "/contacts/x" }));
    expect(err.status).toBe(404);
    expect(err.kind).toBe("not_found");
  });

  it("prefers the body statusCode over the HTTP status", async () => {
    // ghl-proxy returns the upstream GHL status in the body's statusCode
    invoke.mockResolvedValue({
      data: null,
      error: httpError(500, { error: "conflict upstream", statusCode: 409 }),
    });

    const err = await expectProxyError(ghlProxy({ method: "POST", path: "/contacts/" }));
    expect(err.status).toBe(409);
    expect(err.kind).toBe("conflict");
  });

  it("maps non-HTTP errors to network when offline", async () => {
    const onLine = vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    invoke.mockResolvedValue({ data: null, error: new Error("fetch failed") });

    const err = await expectProxyError(ghlProxy({ method: "GET", path: "/contacts/x" }));
    expect(err.kind).toBe("network");
    onLine.mockRestore();
  });

  it("maps non-HTTP errors to server when online", async () => {
    invoke.mockResolvedValue({ data: null, error: new Error("boom") });

    const err = await expectProxyError(ghlProxy({ method: "GET", path: "/contacts/x" }));
    expect(err.kind).toBe("server");
    expect(err.status).toBe(500);
    expect(err.message).toBe("boom");
  });
});
