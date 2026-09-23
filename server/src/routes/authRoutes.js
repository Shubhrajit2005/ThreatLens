import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import authenticate from "../middleware/auth.js";
import validate from "../middleware/validation.js";
import {
  registerSchema,
  loginSchema,
} from "../utils/authValidation.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  register
);

router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  login
);
router.get("/me", authenticate, getMe);

export default router;
