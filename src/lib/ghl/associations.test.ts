import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { ghlProxy } from "../ghlProxy";
import { resolveLinkedContact, clearLinkedContactCache } from "./associations";

vi.mock("../ghlProxy", () => ({ ghlProxy: vi.fn() }));

const proxy = ghlProxy as Mock;

describe("resolveLinkedContact", () => {
  beforeEach(() => {
    proxy.mockReset();
    clearLinkedContactCache();
  });

  it("queries the contact side with the relations nested filter", async () => {
    proxy.mockResolvedValue({ contacts: [{ id: "contact-1" }] });

    const contactId = await resolveLinkedContact("offer", "offer-9");

    expect(contactId).toBe("contact-1");
    expect(proxy).toHaveBeenCalledWith({
      method: "POST",
      path: "/contacts/search",
      body: {
        page: 1,
        pageLimit: 1,
        filters: [
          {
            field: "relations",
            operator: "nested",
            value: [
              { field: "objectKey", operator: "eq", value: "custom_objects.real_estate_offer" },
              { field: "recordId", operator: "eq", value: "offer-9" },
            ],
          },
        ],
      },
    });
  });

  it("maps each entity type to its GHL objectKey", async () => {
    proxy.mockResolvedValue({ contacts: [] });

    await resolveLinkedContact("opportunity", "x");
    await resolveLinkedContact("property", "x");

    const objectKeyOf = (call: number) =>
      proxy.mock.calls[call][0].body.filters[0].value[0].value;
    expect(objectKeyOf(0)).toBe("opportunity");
    expect(objectKeyOf(1)).toBe("custom_objects.properties");
  });

  it("returns null when no contact is related", async () => {
    proxy.mockResolvedValue({ contacts: [] });
    expect(await resolveLinkedContact("property", "p-1")).toBeNull();
  });

  it("caches resolved links per entity", async () => {
    proxy.mockResolvedValue({ contacts: [{ id: "contact-2" }] });

    await resolveLinkedContact("offer", "offer-1");
    const second = await resolveLinkedContact("offer", "offer-1");

    expect(second).toBe("contact-2");
    expect(proxy).toHaveBeenCalledTimes(1);

    await resolveLinkedContact("offer", "offer-other");
    expect(proxy).toHaveBeenCalledTimes(2);
  });

  it("returns null on errors without caching the failure", async () => {
    proxy.mockRejectedValueOnce(new Error("boom"));
    expect(await resolveLinkedContact("offer", "offer-1")).toBeNull();

    proxy.mockResolvedValueOnce({ contacts: [{ id: "contact-3" }] });
    expect(await resolveLinkedContact("offer", "offer-1")).toBe("contact-3");
    expect(proxy).toHaveBeenCalledTimes(2);
  });
});
