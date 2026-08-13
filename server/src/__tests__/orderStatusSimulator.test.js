jest.mock("../services/order.service", () => ({
  updateOrderStatus: jest.fn(),
}));

const orderService = require("../services/order.service");
const {
  scheduleStatusProgression,
  STATUS_SCHEDULE,
} = require("../services/orderStatusSimulator");

describe("orderStatusSimulator", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("progresses an order through PREPARING -> OUT_FOR_DELIVERY -> DELIVERED, emitting socket updates", async () => {
    orderService.updateOrderStatus.mockImplementation((id, status) =>
      Promise.resolve({ id, status })
    );

    const emit = jest.fn();
    const to = jest.fn(() => ({ emit }));
    const io = { to };

    scheduleStatusProgression(42, io);

    await jest.advanceTimersByTimeAsync(STATUS_SCHEDULE[0].delayMs);
    expect(orderService.updateOrderStatus).toHaveBeenCalledWith(42, "PREPARING");
    expect(to).toHaveBeenCalledWith("order-42");
    expect(emit).toHaveBeenCalledWith("orderStatusUpdate", { orderId: 42, status: "PREPARING" });

    await jest.advanceTimersByTimeAsync(
      STATUS_SCHEDULE[1].delayMs - STATUS_SCHEDULE[0].delayMs
    );
    expect(orderService.updateOrderStatus).toHaveBeenCalledWith(42, "OUT_FOR_DELIVERY");
    expect(emit).toHaveBeenCalledWith("orderStatusUpdate", {
      orderId: 42,
      status: "OUT_FOR_DELIVERY",
    });

    await jest.advanceTimersByTimeAsync(
      STATUS_SCHEDULE[2].delayMs - STATUS_SCHEDULE[1].delayMs
    );
    expect(orderService.updateOrderStatus).toHaveBeenCalledWith(42, "DELIVERED");
    expect(emit).toHaveBeenCalledWith("orderStatusUpdate", { orderId: 42, status: "DELIVERED" });
  });

  it("does not throw when io is not provided", async () => {
    orderService.updateOrderStatus.mockResolvedValue({ id: 1, status: "PREPARING" });

    scheduleStatusProgression(1, undefined);

    await expect(
      jest.advanceTimersByTimeAsync(STATUS_SCHEDULE[0].delayMs)
    ).resolves.not.toThrow();
  });
});
