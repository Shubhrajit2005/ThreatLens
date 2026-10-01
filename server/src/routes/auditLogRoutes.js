import express from "express";

import { getAuditLogs } from "../controllers/auditLogController.js";

import authenticate from "../middleware/auth.js";

import authorize from "../middleware/rbac.js";

const router = express.Router();

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     description: Retrieve audit log entries. This endpoint is restricted to administrators.
 *     tags:
 *       - Audit Logs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       401:
 *         description: Authentication token required
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  "/",
  authenticate,
  authorize("admin"),
  getAuditLogs
);

export default router;