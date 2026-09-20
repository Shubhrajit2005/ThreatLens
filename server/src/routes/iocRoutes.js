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
  createIOC
);

// Update — analysts and admins
router.patch(
  "/:id",
  authenticate,
  authorize("admin", "analyst"),
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