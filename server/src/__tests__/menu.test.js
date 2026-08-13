const request = require("supertest");

jest.mock("../config/db", () => ({
  menuItem: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
}));

const prisma = require("../config/db");
const createApp = require("../app");

const app = createApp();

describe("Menu API", () => {
  afterEach(() => jest.clearAllMocks());

  it("GET /api/menu returns the list of menu items", async () => {
    const items = [
      { id: 1, name: "Margherita Pizza", price: "8.99" },
      { id: 2, name: "Classic Cheeseburger", price: "7.49" },
    ];
    prisma.menuItem.findMany.mockResolvedValue(items);

    const res = await request(app).get("/api/menu");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(items);
  });

  it("GET /api/menu/:id returns a single menu item", async () => {
    const item = { id: 1, name: "Margherita Pizza", price: "8.99" };
    prisma.menuItem.findUnique.mockResolvedValue(item);

    const res = await request(app).get("/api/menu/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(item);
    expect(prisma.menuItem.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it("GET /api/menu/:id returns 404 when the item does not exist", async () => {
    prisma.menuItem.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/api/menu/999");

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it("GET /api/menu/:id returns 400 for a non-numeric id", async () => {
    const res = await request(app).get("/api/menu/abc");

    expect(res.status).toBe(400);
  });
});
