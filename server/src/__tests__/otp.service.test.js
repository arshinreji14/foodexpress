jest.mock("../config/db", () => ({
  otpCode: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("crypto", () => ({
  randomInt: jest.fn(),
}));

const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const otpService = require("../services/otp.service");

describe("otp.service", () => {
  afterEach(() => jest.clearAllMocks());

  describe("createOtp", () => {
    it("generates a zero-padded 6-digit code, hashes it, and stores it with an expiry", async () => {
      crypto.randomInt.mockReturnValue(42);
      bcrypt.hash.mockResolvedValue("hashed-code");
      prisma.otpCode.create.mockResolvedValue({});

      const result = await otpService.createOtp("jane@example.com");

      expect(result.code).toBe("000042");
      expect(bcrypt.hash).toHaveBeenCalledWith("000042", 10);
      expect(prisma.otpCode.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: "jane@example.com",
            codeHash: "hashed-code",
          }),
        })
      );
    });
  });

  describe("verifyOtp", () => {
    it("succeeds and marks the code consumed for a valid, unexpired code", async () => {
      prisma.otpCode.findFirst.mockResolvedValue({
        id: 1,
        codeHash: "hashed-code",
        expiresAt: new Date(Date.now() + 60_000),
        consumedAt: null,
      });
      bcrypt.compare.mockResolvedValue(true);

      await otpService.verifyOtp("jane@example.com", "123456");

      expect(prisma.otpCode.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { consumedAt: expect.any(Date) },
      });
    });

    it("throws when there is no pending code for the email", async () => {
      prisma.otpCode.findFirst.mockResolvedValue(null);

      await expect(otpService.verifyOtp("jane@example.com", "123456")).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("throws when the code has expired", async () => {
      prisma.otpCode.findFirst.mockResolvedValue({
        id: 1,
        codeHash: "hashed-code",
        expiresAt: new Date(Date.now() - 60_000),
        consumedAt: null,
      });

      await expect(otpService.verifyOtp("jane@example.com", "123456")).rejects.toMatchObject({
        statusCode: 400,
      });
      expect(prisma.otpCode.update).not.toHaveBeenCalled();
    });

    it("throws when the code does not match", async () => {
      prisma.otpCode.findFirst.mockResolvedValue({
        id: 1,
        codeHash: "hashed-code",
        expiresAt: new Date(Date.now() + 60_000),
        consumedAt: null,
      });
      bcrypt.compare.mockResolvedValue(false);

      await expect(otpService.verifyOtp("jane@example.com", "999999")).rejects.toMatchObject({
        statusCode: 400,
      });
      expect(prisma.otpCode.update).not.toHaveBeenCalled();
    });
  });
});
