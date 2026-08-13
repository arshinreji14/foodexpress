import { describe, it, expect, beforeEach } from "vitest";
import { getStoredOrderIds, addStoredOrderId } from "../utils/orderHistory";

describe("orderHistory", () => {
  beforeEach(() => localStorage.clear());

  it("returns an empty array when nothing is stored", () => {
    expect(getStoredOrderIds()).toEqual([]);
  });

  it("stores an order id and returns it, most recent first", () => {
    addStoredOrderId(1);
    addStoredOrderId(2);

    expect(getStoredOrderIds()).toEqual([2, 1]);
  });

  it("moves a re-added id to the front instead of duplicating it", () => {
    addStoredOrderId(1);
    addStoredOrderId(2);
    addStoredOrderId(1);

    expect(getStoredOrderIds()).toEqual([1, 2]);
  });

  it("caps the stored history at 25 entries", () => {
    for (let i = 1; i <= 30; i += 1) addStoredOrderId(i);

    const ids = getStoredOrderIds();
    expect(ids).toHaveLength(25);
    expect(ids[0]).toBe(30);
    expect(ids).not.toContain(1);
  });

  it("returns an empty array if localStorage contains invalid JSON", () => {
    localStorage.setItem("foodexpress_guest_order_ids", "not-json");
    expect(getStoredOrderIds()).toEqual([]);
  });
});
