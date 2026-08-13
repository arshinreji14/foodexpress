import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CartProvider, useCart } from "../context/CartContext";

const pizza = { id: 1, name: "Pizza", price: "8.99" };
const burger = { id: 2, name: "Burger", price: "7.49" };

function renderCart() {
  return renderHook(() => useCart(), { wrapper: CartProvider });
}

describe("CartContext", () => {
  it("starts empty", () => {
    const { result } = renderCart();
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it("adds a new item to the cart", () => {
    const { result } = renderCart();
    act(() => result.current.addItem(pizza));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual({ menuItem: pizza, quantity: 1 });
    expect(result.current.totalItems).toBe(1);
  });

  it("increments quantity when adding the same item again", () => {
    const { result } = renderCart();
    act(() => result.current.addItem(pizza));
    act(() => result.current.addItem(pizza, 2));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
  });

  it("updates the quantity of an item directly", () => {
    const { result } = renderCart();
    act(() => result.current.addItem(pizza));
    act(() => result.current.updateQuantity(pizza.id, 5));

    expect(result.current.items[0].quantity).toBe(5);
  });

  it("removes an item when its quantity is set to 0", () => {
    const { result } = renderCart();
    act(() => result.current.addItem(pizza));
    act(() => result.current.updateQuantity(pizza.id, 0));

    expect(result.current.items).toHaveLength(0);
  });

  it("removes an item explicitly", () => {
    const { result } = renderCart();
    act(() => result.current.addItem(pizza));
    act(() => result.current.addItem(burger));
    act(() => result.current.removeItem(pizza.id));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].menuItem.id).toBe(burger.id);
  });

  it("calculates total price across multiple distinct items", () => {
    const { result } = renderCart();
    act(() => result.current.addItem(pizza, 2)); // 17.98
    act(() => result.current.addItem(burger, 1)); // 7.49

    expect(result.current.totalItems).toBe(3);
    expect(result.current.totalPrice).toBeCloseTo(25.47, 2);
  });

  it("clears the cart", () => {
    const { result } = renderCart();
    act(() => result.current.addItem(pizza));
    act(() => result.current.clearCart());

    expect(result.current.items).toEqual([]);
  });

  it("throws when used outside of a CartProvider", () => {
    expect(() => renderHook(() => useCart())).toThrow(/CartProvider/);
  });
});
