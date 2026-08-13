import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MenuList from "../components/Menu/MenuList";
import { CartProvider, useCart } from "../context/CartContext";
import * as menuApi from "../api/menuApi";

vi.mock("../api/menuApi");

const items = [
  {
    id: 1,
    name: "Margherita Pizza",
    description: "Tomato, mozzarella, basil",
    price: "8.99",
    imageUrl: "https://example.com/pizza.jpg",
  },
  {
    id: 2,
    name: "Classic Cheeseburger",
    description: "Beef, cheddar, lettuce",
    price: "7.49",
    imageUrl: "https://example.com/burger.jpg",
  },
];

function CartTotalDisplay() {
  const { totalItems } = useCart();
  return <div data-testid="total-items">{totalItems}</div>;
}

function renderWithCart() {
  return render(
    <CartProvider>
      <CartTotalDisplay />
      <MenuList />
    </CartProvider>
  );
}

describe("MenuList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loading state initially", () => {
    menuApi.fetchMenuItems.mockReturnValue(new Promise(() => {}));
    renderWithCart();

    expect(screen.getByText(/loading menu/i)).toBeInTheDocument();
  });

  it("renders menu items once loaded", async () => {
    menuApi.fetchMenuItems.mockResolvedValue(items);
    renderWithCart();

    expect(await screen.findByText("Margherita Pizza")).toBeInTheDocument();
    expect(screen.getByText("Classic Cheeseburger")).toBeInTheDocument();
    expect(screen.getByText("$8.99")).toBeInTheDocument();
  });

  it("shows an error message when the request fails", async () => {
    menuApi.fetchMenuItems.mockRejectedValue(new Error("network error"));
    renderWithCart();

    expect(await screen.findByText(/failed to load the menu/i)).toBeInTheDocument();
  });

  it("adds an item to the cart when 'Add to cart' is clicked", async () => {
    menuApi.fetchMenuItems.mockResolvedValue(items);
    renderWithCart();

    const user = userEvent.setup();
    const addButtons = await screen.findAllByRole("button", { name: /add to cart/i });
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId("total-items").textContent).toBe("1");
    });
  });
});
