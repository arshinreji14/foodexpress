import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import OrderStatusTracker from "../components/Order/OrderStatusTracker";

const handlers = {};
const emit = vi.fn();
const disconnect = vi.fn();

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    emit,
    on: (event, cb) => {
      handlers[event] = cb;
    },
    disconnect,
  })),
}));

describe("OrderStatusTracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(handlers).forEach((key) => delete handlers[key]);
  });

  it("renders the initial status as the current step", () => {
    render(<OrderStatusTracker orderId={7} initialStatus="RECEIVED" />);

    expect(screen.getByText("Order #7")).toBeInTheDocument();
    expect(emit).toHaveBeenCalledWith("joinOrder", 7);
  });

  it("advances the tracker when a socket status update arrives", () => {
    render(<OrderStatusTracker orderId={7} initialStatus="RECEIVED" />);

    act(() => {
      handlers.orderStatusUpdate({ orderId: 7, status: "PREPARING" });
    });

    const preparingLabel = screen.getByText("Preparing");
    expect(preparingLabel.className).toMatch(/text-slate-900/);
  });

  it("ignores updates for a different order id", () => {
    render(<OrderStatusTracker orderId={7} initialStatus="RECEIVED" />);

    act(() => {
      handlers.orderStatusUpdate({ orderId: 99, status: "DELIVERED" });
    });

    const deliveredLabel = screen.getByText("Delivered");
    expect(deliveredLabel.className).toMatch(/text-slate-400/);
  });
});
