const request = require("supertest");

jest.mock("../config/db", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  otpCode: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const prisma = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const createApp = require("../app");

process.env.JWT_SECRET = "test-secret";
process.env.NODE_ENV = "test";

const app = createApp();

describe("Auth API (OTP)", () => {
  afterEach(() => jest.clearAllMocks());

  describe("POST /api/auth/request-otp", () => {
    it("creates an OTP and reports isNewUser: true for an unknown email", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.otpCode.create.mockResolvedValue({});

      const res = await request(app)
        .post("/api/auth/request-otp")
        .send({ email: "new@example.com" });

      expect(res.status).toBe(200);
      expect(res.body.isNewUser).toBe(true);
      expect(prisma.otpCode.create).toHaveBeenCalledTimes(1);
    });

    it("reports isNewUser: false for an existing email", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, email: "jane@example.com" });
      prisma.otpCode.create.mockResolvedValue({});

      const res = await request(app)
        .post("/api/auth/request-otp")
        .send({ email: "jane@example.com" });

      expect(res.status).toBe(200);
      expect(res.body.isNewUser).toBe(false);
    });

    it("returns 400 for an invalid email", async () => {
      const res = await request(app).post("/api/auth/request-otp").send({ email: "not-an-email" });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/verify-otp", () => {
    it("logs in an existing user with a valid code", async () => {
      prisma.otpCode.findFirst.mockResolvedValue({
        id: 1,
        codeHash: bcrypt.hashSync("123456", 10),
        expiresAt: new Date(Date.now() + 60_000),
        consumedAt: null,
      });
      prisma.otpCode.update.mockResolvedValue({});
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: "Jane Doe",
        email: "jane@example.com",
      });
      jwt.sign.mockReturnValue("signed-token");

      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "jane@example.com", code: "123456" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        user: { id: 1, name: "Jane Doe", email: "jane@example.com" },
        token: "signed-token",
      });
    });

    it("creates a new user when the email doesn't exist yet, given a name", async () => {
      prisma.otpCode.findFirst.mockResolvedValue({
        id: 1,
        codeHash: bcrypt.hashSync("123456", 10),
        expiresAt: new Date(Date.now() + 60_000),
        consumedAt: null,
      });
      prisma.otpCode.update.mockResolvedValue({});
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 2,
        name: "New Guy",
        email: "new@example.com",
      });
      jwt.sign.mockReturnValue("signed-token");

      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "new@example.com", code: "123456", name: "New Guy" });

      expect(res.status).toBe(200);
      expect(res.body.user).toEqual({ id: 2, name: "New Guy", email: "new@example.com" });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { name: "New Guy", email: "new@example.com" },
      });
    });

    it("returns 400 when a new email verifies without a name", async () => {
      prisma.otpCode.findFirst.mockResolvedValue({
        id: 1,
        codeHash: bcrypt.hashSync("123456", 10),
        expiresAt: new Date(Date.now() + 60_000),
        consumedAt: null,
      });
      prisma.otpCode.update.mockResolvedValue({});
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "new@example.com", code: "123456" });

      expect(res.status).toBe(400);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("returns 400 for an incorrect code", async () => {
      prisma.otpCode.findFirst.mockResolvedValue({
        id: 1,
        codeHash: bcrypt.hashSync("123456", 10),
        expiresAt: new Date(Date.now() + 60_000),
        consumedAt: null,
      });

      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "jane@example.com", code: "654321" });

      expect(res.status).toBe(400);
    });

    it("returns 400 for a malformed code", async () => {
      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "jane@example.com", code: "abc" });

      expect(res.status).toBe(400);
    });

    it("returns 400 when there is no pending OTP for the email", async () => {
      prisma.otpCode.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "jane@example.com", code: "123456" });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns 401 when no token is provided", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("returns the current user when a valid token is provided", async () => {
      jwt.verify.mockReturnValue({ sub: 1 });
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: "Jane Doe",
        email: "jane@example.com",
      });

      const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer valid-token");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 1, name: "Jane Doe", email: "jane@example.com" });
    });

    it("returns 401 for an invalid token", async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("invalid token");
      });

      const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer bad-token");

      expect(res.status).toBe(401);
    });
  });
});
