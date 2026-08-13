const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const { ApiError } = require("../middleware/errorHandler");

const OTP_LENGTH = 6;
const OTP_TTL_MS = 10 * 60 * 1000;
const SALT_ROUNDS = 10;

function generateCode() {
  const max = 10 ** OTP_LENGTH;
  const value = crypto.randomInt(0, max);
  return String(value).padStart(OTP_LENGTH, "0");
}

async function createOtp(email) {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.otpCode.create({
    data: { email, codeHash, expiresAt },
  });

  // Simulated delivery: in a real deployment this would call an email/SMS
  // provider (e.g. Brevo) instead of logging to the server console.
  console.log(`[OTP] Code for ${email}: ${code} (expires in 10 minutes)`);

  return { code };
}

async function verifyOtp(email, code) {
  const otp = await prisma.otpCode.findFirst({
    where: { email, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw new ApiError(400, "No pending code for this email. Request a new one.");
  }

  if (otp.expiresAt < new Date()) {
    throw new ApiError(400, "This code has expired. Request a new one.");
  }

  const isValid = await bcrypt.compare(code, otp.codeHash);
  if (!isValid) {
    throw new ApiError(400, "Incorrect code");
  }

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });
}

module.exports = { createOtp, verifyOtp };
