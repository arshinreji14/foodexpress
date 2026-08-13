import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CheckoutForm from "../components/Checkout/CheckoutForm";
import { CartProvider, useCart } from "../context/CartContext";
import * as orderApi from "../api/orderApi";
import { getStoredOrderIds } from "../utils/orderHistory";

vi.mock("../api/orderApi");

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

const pizza = { id: 1, name: "Pizza", price: "8.99" };

function Seeder() {
  const { addItem } = useCart();
  return (
    <button type="button" onClick={() => addItem(pizza)}>
      seed-cart
    </button>
  );
}

function renderForm() {
  return render(
    <MemoryRouter>
      <CartProvider>
        <Seeder />
        <CheckoutForm />
      </CartProvider>
    </MemoryRouter>
  );
}

describe("CheckoutForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("shows validation errors when required fields are empty", async () => {
    renderForm();
    const user = userEvent.setup();

    await user.click(screen.getByText("seed-cart"));
    await user.click(screen.getByRole("button", { name: /place order/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/address is required/i)).toBeInTheDocument();
    expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
    expect(orderApi.placeOrder).not.toHaveBeenCalled();
  });

  it("shows a validation error for an invalid phone number", async () => {
    renderForm();
    const user = userEvent.setup();

    await user.click(screen.getByText("seed-cart"));
    await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/delivery address/i), "123 Main St");
    await user.type(screen.getByLabelText(/phone number/i), "abc");
    await user.click(screen.getByRole("button", { name: /place order/i }));

    expect(await screen.findByText(/valid phone number/i)).toBeInTheDocument();
  });

  it("submits the order and navigates to the order status page on success", async () => {
    orderApi.placeOrder.mockResolvedValue({ id: 42 });
    renderForm();
    const user = userEvent.setup();

    await user.click(screen.getByText("seed-cart"));
    await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/delivery address/i), "123 Main St");
    await user.type(screen.getByLabelText(/phone number/i), "555-123-4567");
    await user.click(screen.getByRole("button", { name: /place order/i }));

    await waitFor(() => {
      expect(orderApi.placeOrder).toHaveBeenCalledWith({
        customerName: "Jane Doe",
        address: "123 Main St",
        phone: "555-123-4567",
        items: [{ menuItemId: 1, quantity: 1 }],
      });
    });
    expect(navigateMock).toHaveBeenCalledWith("/order/42");
    expect(getStoredOrderIds()).toEqual([42]);
  });

  it("shows a server error message when the API call fails", async () => {
    orderApi.placeOrder.mockRejectedValue({
      response: { data: { error: "Menu item(s) not found: 1" } },
    });
    renderForm();
    const user = userEvent.setup();

    await user.click(screen.getByText("seed-cart"));
    await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/delivery address/i), "123 Main St");
    await user.type(screen.getByLabelText(/phone number/i), "555-123-4567");
    await user.click(screen.getByRole("button", { name: /place order/i }));

    expect(await screen.findByText(/menu item\(s\) not found/i)).toBeInTheDocument();
  });
});
