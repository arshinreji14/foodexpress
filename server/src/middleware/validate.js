const { z } = require("zod");
const { ApiError } = require("./errorHandler");

const createOrderSchema = z.object({
  customerName: z.string().trim().min(1, "customerName is required"),
  address: z.string().trim().min(1, "address is required"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "phone must be a valid phone number"),
  items: z
    .array(
      z.object({
        menuItemId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "items must contain at least one item"),
});

function validateCreateOrder(req, res, next) {
  const result = createOrderSchema.safeParse(req.body);
  if (!result.success) {
    return next(new ApiError(400, "Invalid order payload", result.error.flatten().fieldErrors));
  }
  req.body = result.data;
  next();
}

const requestOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email("email must be valid"),
});

const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email("email must be valid"),
  code: z.string().trim().regex(/^\d{6}$/, "code must be a 6-digit number"),
  name: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
});

function makeValidator(schema) {
  return function validate(req, res, next) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new ApiError(400, "Invalid payload", result.error.flatten().fieldErrors));
    }
    req.body = result.data;
    next();
  };
}

const validateRequestOtp = makeValidator(requestOtpSchema);
const validateVerifyOtp = makeValidator(verifyOtpSchema);

module.exports = {
  createOrderSchema,
  validateCreateOrder,
  requestOtpSchema,
  verifyOtpSchema,
  validateRequestOtp,
  validateVerifyOtp,
};
