import express from "express";

import {
  createInvestigation,
  getInvestigations,
  getInvestigationById,
  updateInvestigation,
  addInvestigationNote,
} from "../controllers/investigationController.js";

import authenticate from "../middleware/auth.js";
import authorize from "../middleware/rbac.js";
import validate from "../middleware/validation.js";

import {
  createInvestigationSchema,
  updateInvestigationSchema,
  addInvestigationNoteSchema,
  investigationIdSchema,
} from "../middleware/investigationValidation.js";

const router = express.Router();

/**
 * @swagger
 * /api/investigations:
 *   get:
 *     summary: List investigations
 *     description: Retrieve all investigations with their related IOC and analyst information.
 *     tags:
 *       - Investigations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Investigations retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  "/",
  authenticate,
  authorize("admin", "analyst", "viewer"),
  getInvestigations
);

/**
 * @swagger
 * /api/investigations:
 *   post:
 *     summary: Create an investigation
 *     description: Create a new investigation linked to an existing IOC. Requires Admin or Analyst role.
 *     tags:
 *       - Investigations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - iocId
 *             properties:
 *               title:
 *                 type: string
 *                 example: Investigate suspicious IP
 *               iocId:
 *                 type: string
 *                 example: 6ab7fa386fe3e17f03275f40
 *               priority:
 *                 type: string
 *                 enum:
 *                   - low
 *                   - medium
 *                   - high
 *                   - critical
 *                 example: high
 *     responses:
 *       201:
 *         description: Investigation created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: IOC not found
 */
router.post(
  "/",
  authenticate,
  authorize("admin", "analyst"),
  validate(createInvestigationSchema),
  createInvestigation
);

/**
 * @swagger
 * /api/investigations/{id}:
 *   get:
 *     summary: Get an investigation by ID
 *     description: Retrieve a single investigation with its related IOC and analyst information.
 *     tags:
 *       - Investigations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6ab7fbac9fb1dcd021443b29
 *     responses:
 *       200:
 *         description: Investigation retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Investigation not found
 */
router.get(
  "/:id",
  authenticate,
  authorize("admin", "analyst", "viewer"),
  validate(investigationIdSchema, "params"),
  getInvestigationById
);

/**
 * @swagger
 * /api/investigations/{id}:
 *   patch:
 *     summary: Update an investigation
 *     description: Update the priority or status of an investigation. Requires Admin or Analyst role.
 *     tags:
 *       - Investigations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6ab7fbac9fb1dcd021443b29
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               priority:
 *                 type: string
 *                 enum:
 *                   - low
 *                   - medium
 *                   - high
 *                   - critical
 *                 example: critical
 *               status:
 *                 type: string
 *                 enum:
 *                   - open
 *                   - in_progress
 *                   - resolved
 *                   - false_positive
 *                 example: in_progress
 *     responses:
 *       200:
 *         description: Investigation updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Investigation not found
 */
router.patch(
  "/:id",
  authenticate,
  authorize("admin", "analyst"),
  validate(investigationIdSchema, "params"),
  validate(updateInvestigationSchema),
  updateInvestigation
);

/**
 * @swagger
 * /api/investigations/{id}/notes:
 *   post:
 *     summary: Add a note to an investigation
 *     description: Add an investigation note. The authenticated user's ID is stored as the note author.
 *     tags:
 *       - Investigations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6ab7fbac9fb1dcd021443b29
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 maxLength: 2000
 *                 example: Initial investigation review completed.
 *     responses:
 *       201:
 *         description: Investigation note added successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Investigation not found
 */
router.post(
  "/:id/notes",
  authenticate,
  authorize("admin", "analyst"),
  validate(investigationIdSchema, "params"),
  validate(addInvestigationNoteSchema),
  addInvestigationNote
);

export default router;