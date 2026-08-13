const authService = require("../services/auth.service");
const { ApiError } = require("../middleware/errorHandler");

async function requestOtp(req, res, next) {
  try {
    const result = await authService.requestOtp(req.body.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const result = await authService.verifyOtp(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getUserById(req.userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { requestOtp, verifyOtp, me };
