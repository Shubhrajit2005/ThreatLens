import express from "express";
import {
  createIOC,
  getAllIOCs,
  getIOCById,
  updateIOC,
  deleteIOC,
} from "../controllers/iocController.js";
import authenticate from "../middleware/auth.js";
import authorize from "../middleware/rbac.js";
import validate from "../middleware/validation.js";
import { createIOCSchema } from "../utils/iocValidation.js";
import { updateIOCSchema } from "../utils/iocUpdateValidation.js";

const router = express.Router();

// Read access — all authenticated roles
router.get(
  "/",
  authenticate,
  authorize("admin", "analyst", "viewer"),
  getAllIOCs
);

router.get(
  "/:id",
  authenticate,
  authorize("admin", "analyst", "viewer"),
  getIOCById
);

// Create — analysts and admins
router.post(
  "/",
  authenticate,
  authorize("admin", "analyst"),
  validate(createIOCSchema),
  createIOC
);

// Update — analysts and admins
router.patch(
  "/:id",
  authenticate,
  authorize("admin", "analyst"),
  validate(updateIOCSchema),
  updateIOC
);

// Delete — admins only
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteIOC
);

export default router;