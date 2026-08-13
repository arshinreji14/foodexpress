const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const otpService = require("./otp.service");
const { ApiError } = require("../middleware/errorHandler");

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function signToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

async function requestOtp(email) {
  const existing = await prisma.user.findUnique({ where: { email } });
  const { code } = await otpService.createOtp(email);

  return {
    isNewUser: !existing,
    ...(process.env.NODE_ENV !== "production" ? { devCode: code } : {}),
  };
}

async function verifyOtp({ email, code, name }) {
  await otpService.verifyOtp(email, code);

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    if (!name || !name.trim()) {
      throw new ApiError(400, "Name is required for new accounts");
    }
    user = await prisma.user.create({ data: { name: name.trim(), email } });
  }

  return { user: toPublicUser(user), token: signToken(user) };
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toPublicUser(user) : null;
}

module.exports = { requestOtp, verifyOtp, getUserById, toPublicUser };
