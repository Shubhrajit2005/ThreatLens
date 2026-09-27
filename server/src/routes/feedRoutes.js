import express from "express";
import { getFeeds } from "../controllers/feedController.js";
import authenticate from "../middleware/auth.js";
import authorize from "../middleware/rbac.js";

const router = express.Router();

/**
 * @swagger
 * /api/feeds:
 *   get:
 *     summary: List available threat intelligence feeds
 *     description: Retrieve configured threat intelligence feeds and their reliability scores. Requires Admin, Analyst, or Viewer role.
 *     tags:
 *       - Feeds
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feeds retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 4
 *                 feeds:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: OTX
 *                       reliability:
 *                         type: number
 *                         example: 70
 *                       enabled:
 *                         type: boolean
 *                         example: true
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  "/",
  authenticate,
  authorize("admin", "analyst", "viewer"),
  getFeeds
);

export default router;