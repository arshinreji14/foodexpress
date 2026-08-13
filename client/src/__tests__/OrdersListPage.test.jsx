import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import OrdersListPage from "../pages/OrdersListPage";
import * as orderApi from "../api/orderApi";

vi.mock("../api/orderApi");

const orders = [
  { id: 2, status: "PREPARING", totalAmount: "17.98", createdAt: "2026-08-12T10:00:00.000Z" },
  { id: 1, status: "DELIVERED", totalAmount: "8.99", createdAt: "2026-08-11T10:00:00.000Z" },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <OrdersListPage />
    </MemoryRouter>
  );
}

describe("OrdersListPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows a loading state initially", () => {
    orderApi.fetchOrders.mockReturnValue(new Promise(() => {}));
    renderPage();

    expect(screen.getByText(/loading your orders/i)).toBeInTheDocument();
  });

  it("renders a list of orders once loaded", async () => {
    orderApi.fetchOrders.mockResolvedValue(orders);
    renderPage();

    expect(await screen.findByText("Order #2")).toBeInTheDocument();
    expect(screen.getByText("Order #1")).toBeInTheDocument();
    expect(screen.getByText("Preparing")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();
    expect(screen.getByText("$17.98")).toBeInTheDocument();
  });

  it("shows an empty state when there are no orders", async () => {
    orderApi.fetchOrders.mockResolvedValue([]);
    renderPage();

    expect(await screen.findByText(/haven't placed any orders/i)).toBeInTheDocument();
  });

  it("shows an error message when the request fails", async () => {
    orderApi.fetchOrders.mockRejectedValue(new Error("network error"));
    renderPage();

    expect(await screen.findByText(/failed to load your orders/i)).toBeInTheDocument();
  });
});
