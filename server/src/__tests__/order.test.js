const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../config/db", () => ({
  order: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  menuItem: {
    findMany: jest.fn(),
  },
}));

jest.mock("../services/orderStatusSimulator", () => ({
  scheduleStatusProgression: jest.fn(),
}));

process.env.JWT_SECRET = "test-secret";

const prisma = require("../config/db");
const { scheduleStatusProgression } = require("../services/orderStatusSimulator");
const createApp = require("../app");

const app = createApp();

const AUTH_USER_ID = 1;
const authToken = jwt.sign({ sub: AUTH_USER_ID }, process.env.JWT_SECRET);
const authHeader = `Bearer ${authToken}`;

const validPayload = {
  customerName: "John Doe",
  address: "123 Main St, Springfield",
  phone: "555-123-4567",
  items: [{ menuItemId: 1, quantity: 2 }],
};

describe("Order API", () => {
  afterEach(() => jest.clearAllMocks());

  describe("guest checkout (no auth token)", () => {
    it("POST /api/orders creates a guest order (userId null) and starts status progression", async () => {
      prisma.menuItem.findMany.mockResolvedValue([{ id: 1, price: "8.99" }]);
      const createdOrder = {
        id: 1,
        userId: null,
        status: "RECEIVED",
        totalAmount: "17.98",
        customerName: "John Doe",
        items: [],
      };
      prisma.order.create.mockResolvedValue(createdOrder);

      const res = await request(app).post("/api/orders").send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(createdOrder);
      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ userId: null }) })
      );
      expect(scheduleStatusProgression).toHaveBeenCalledWith(1, undefined);
    });

    it("GET /api/orders/:id lets anyone view a guest order by id", async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 1, userId: null, status: "RECEIVED" });

      const res = await request(app).get("/api/orders/1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 1, userId: null, status: "RECEIVED" });
    });

    it("GET /api/orders/:id returns 404 for a logged-in user's order when unauthenticated", async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 1, userId: AUTH_USER_ID, status: "RECEIVED" });

      const res = await request(app).get("/api/orders/1");

      expect(res.status).toBe(404);
    });

    it("GET /api/orders still requires authentication (guests have no order list)", async () => {
      const res = await request(app).get("/api/orders");
      expect(res.status).toBe(401);
    });
  });

  describe("logged-in checkout (auth token present)", () => {
    it("POST /api/orders ties the order to the logged-in user", async () => {
      prisma.menuItem.findMany.mockResolvedValue([{ id: 1, price: "8.99" }]);
      const createdOrder = {
        id: 1,
        userId: AUTH_USER_ID,
        status: "RECEIVED",
        totalAmount: "17.98",
        customerName: "John Doe",
        items: [],
      };
      prisma.order.create.mockResolvedValue(createdOrder);

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", authHeader)
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(createdOrder);
      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ userId: AUTH_USER_ID }) })
      );
    });

    it("GET /api/orders/:id returns an order owned by the current user", async () => {
      const order = { id: 1, userId: AUTH_USER_ID, status: "RECEIVED" };
      prisma.order.findUnique.mockResolvedValue(order);

      const res = await request(app).get("/api/orders/1").set("Authorization", authHeader);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(order);
    });

    it("GET /api/orders/:id returns 404 when the order belongs to another user", async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 1, userId: 999, status: "RECEIVED" });

      const res = await request(app).get("/api/orders/1").set("Authorization", authHeader);

      expect(res.status).toBe(404);
    });

    it("GET /api/orders/:id can still view a guest order while logged in", async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 1, userId: null, status: "RECEIVED" });

      const res = await request(app).get("/api/orders/1").set("Authorization", authHeader);

      expect(res.status).toBe(200);
    });

    it("GET /api/orders returns only the current user's orders", async () => {
      const orders = [{ id: 1, userId: AUTH_USER_ID }, { id: 2, userId: AUTH_USER_ID }];
      prisma.order.findMany.mockResolvedValue(orders);

      const res = await request(app).get("/api/orders").set("Authorization", authHeader);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(orders);
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: AUTH_USER_ID } })
      );
    });
  });

  describe("validation (applies regardless of auth)", () => {
    it("POST /api/orders returns 400 when required fields are missing", async () => {
      const res = await request(app).post("/api/orders").send({ items: [] });

      expect(res.status).toBe(400);
      expect(prisma.order.create).not.toHaveBeenCalled();
    });

    it("POST /api/orders returns 400 when a menu item does not exist", async () => {
      prisma.menuItem.findMany.mockResolvedValue([]);

      const res = await request(app).post("/api/orders").send(validPayload);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/not found/i);
    });

    it("POST /api/orders returns 400 for a non-positive quantity", async () => {
      const res = await request(app)
        .post("/api/orders")
        .send({ ...validPayload, items: [{ menuItemId: 1, quantity: 0 }] });

      expect(res.status).toBe(400);
    });

    it("POST /api/orders returns 400 for an invalid phone number", async () => {
      const res = await request(app).post("/api/orders").send({ ...validPayload, phone: "abc" });

      expect(res.status).toBe(400);
    });

    it("GET /api/orders/:id returns 404 when the order does not exist", async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      const res = await request(app).get("/api/orders/999");

      expect(res.status).toBe(404);
    });
  });
});
