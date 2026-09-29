import express from "express";
import { getAuditLogs } from "../controllers/auditLogController.js";
import authenticate from "../middleware/auth.js";
import authorize from "../middleware/rbac.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("admin"),
  getAuditLogs
);

export default router;