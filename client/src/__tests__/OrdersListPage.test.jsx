import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import OrdersListPage from "../pages/OrdersListPage";
import * as orderApi from "../api/orderApi";
import { addStoredOrderId } from "../utils/orderHistory";

vi.mock("../api/orderApi");

const useAuthMock = vi.fn();
vi.mock("../context/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

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
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("when logged in", () => {
    beforeEach(() => useAuthMock.mockReturnValue({ isAuthenticated: true }));

    it("shows a loading state initially", () => {
      orderApi.fetchOrders.mockReturnValue(new Promise(() => {}));
      renderPage();

      expect(screen.getByText(/loading your orders/i)).toBeInTheDocument();
    });

    it("renders the account's orders via fetchOrders", async () => {
      orderApi.fetchOrders.mockResolvedValue(orders);
      renderPage();

      expect(await screen.findByText("Order #2")).toBeInTheDocument();
      expect(screen.getByText("Order #1")).toBeInTheDocument();
      expect(screen.getByText("Preparing")).toBeInTheDocument();
      expect(screen.getByText("Delivered")).toBeInTheDocument();
      expect(screen.getByText("$17.98")).toBeInTheDocument();
      expect(screen.queryByText(/showing orders placed from this browser/i)).not.toBeInTheDocument();
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

  describe("as a guest", () => {
    beforeEach(() => useAuthMock.mockReturnValue({ isAuthenticated: false }));

    it("renders orders from locally stored order ids via fetchOrder", async () => {
      addStoredOrderId(2);
      addStoredOrderId(1);
      orderApi.fetchOrder.mockImplementation((id) =>
        Promise.resolve(orders.find((order) => order.id === id))
      );

      renderPage();

      expect(await screen.findByText("Order #2")).toBeInTheDocument();
      expect(screen.getByText("Order #1")).toBeInTheDocument();
      expect(orderApi.fetchOrders).not.toHaveBeenCalled();
      expect(screen.getByText(/showing orders placed from this browser/i)).toBeInTheDocument();
    });

    it("shows an empty state when no orders are stored locally", async () => {
      renderPage();

      expect(await screen.findByText(/haven't placed any orders/i)).toBeInTheDocument();
    });

    it("skips ids that fail to load instead of erroring the whole page", async () => {
      addStoredOrderId(2);
      addStoredOrderId(1);
      orderApi.fetchOrder.mockImplementation((id) =>
        id === 1 ? Promise.reject(new Error("not found")) : Promise.resolve(orders[0])
      );

      renderPage();

      expect(await screen.findByText("Order #2")).toBeInTheDocument();
      expect(screen.queryByText("Order #1")).not.toBeInTheDocument();
    });
  });
});
