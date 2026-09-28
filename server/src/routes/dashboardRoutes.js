import express from "express";
import { getDashboardStats,getDashboardOverview } from "../controllers/dashboardController.js";
import authenticate from "../middleware/auth.js";
import authorize from "../middleware/rbac.js";

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieve aggregated IOC statistics including status, risk level, and IOC type distributions. Requires Admin, Analyst, or Viewer role.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalIOCs:
 *                       type: integer
 *                       example: 25
 *                     status:
 *                       type: object
 *                       properties:
 *                         active:
 *                           type: integer
 *                           example: 18
 *                         reviewed:
 *                           type: integer
 *                           example: 4
 *                         falsePositive:
 *                           type: integer
 *                           example: 2
 *                         archived:
 *                           type: integer
 *                           example: 1
 *                     riskDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: high
 *                           count:
 *                             type: integer
 *                             example: 10
 *                     typeDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: ipv4
 *                           count:
 *                             type: integer
 *                             example: 12
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  "/stats",
  authenticate,
  authorize("admin", "analyst", "viewer"),
  getDashboardStats
);

/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview
 *     description: Retrieve dashboard-ready threat intelligence statistics, feed statistics, recent IOCs, and recent investigations.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  "/overview",
  authenticate,
  authorize("admin", "analyst", "viewer"),
  getDashboardOverview
);
export default router;