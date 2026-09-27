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


/**
 * @swagger
 * /api/iocs:
 *   get:
 *     summary: List IOCs
 *     description: Retrieve all stored IOCs. Requires Admin, Analyst, or Viewer role.
 *     tags:
 *       - IOCs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of IOCs
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */


// Read access — all authenticated roles
router.get(
  "/",
  authenticate,
  authorize("admin", "analyst", "viewer"),
  getAllIOCs
);

/**
 * @swagger
 * /api/iocs/{id}:
 *   get:
 *     summary: Get IOC details
 *     description: Retrieve a specific IOC. Requires Admin, Analyst, or Viewer role.
 *     tags:
 *       - IOCs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: MongoDB ObjectId of the IOC
 *         schema:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: IOC details
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: IOC not found
 */

router.get(
  "/:id",
  authenticate,
  authorize("admin", "analyst", "viewer"),
  getIOCById
);

/**
 * @swagger
 * /api/iocs:
 *   post:
 *     summary: Create a new IOC
 *     description: Create a new IOC. Requires Admin or Analyst role.
 *     tags:
 *       - IOCs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *               - type
 *             properties:
 *               value:
 *                 type: string
 *                 example: 198.51.100.25
 *               type:
 *                 type: string
 *                 enum:
 *                   - ipv4
 *                   - ipv6
 *                   - domain
 *                   - url
 *                   - md5
 *                   - sha1
 *                   - sha256
 *                 example: ipv4
 *               confidence:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 75
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - malware
 *                   - security-test
 *     responses:
 *       201:
 *         description: IOC created successfully
 *       400:
 *         description: Invalid IOC or validation failed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: IOC already exists
 */

// Create — analysts and admins
router.post(
  "/",
  authenticate,
  authorize("admin", "analyst"),
  validate(createIOCSchema),
  createIOC
);

/**
 * @swagger
 * /api/iocs/{id}:
 *   patch:
 *     summary: Update an IOC
 *     description: Update IOC metadata. Requires Admin or Analyst role.
 *     tags:
 *       - IOCs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: MongoDB ObjectId of the IOC
 *         schema:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               confidence:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 90
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - malware
 *                   - confirmed
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - reviewed
 *                   - false_positive
 *                   - archived
 *                 example: reviewed
 *     responses:
 *       200:
 *         description: IOC updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: IOC not found
 */

// Update — analysts and admins
router.patch(
  "/:id",
  authenticate,
  authorize("admin", "analyst"),
  validate(updateIOCSchema),
  updateIOC
);

/**
 * @swagger
 * /api/iocs/{id}:
 *   delete:
 *     summary: Delete an IOC
 *     description: Delete an IOC. Requires Admin role.
 *     tags:
 *       - IOCs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: MongoDB ObjectId of the IOC
 *         schema:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: IOC deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: IOC not found
 */

// Delete — admins only
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteIOC
);

export default router;