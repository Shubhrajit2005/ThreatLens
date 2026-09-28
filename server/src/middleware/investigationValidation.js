import { z } from "zod";

export const createInvestigationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(150, "Title must not exceed 150 characters"),

  iocId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid IOC ID"),

  priority: z
    .enum(["low", "medium", "high", "critical"])
    .optional(),
});

export const updateInvestigationSchema = z
  .object({
    priority: z
      .enum(["low", "medium", "high", "critical"])
      .optional(),

    status: z
      .enum([
        "open",
        "in_progress",
        "resolved",
        "false_positive",
      ])
      .optional(),
  })
  .refine(
    (data) =>
      data.priority !== undefined ||
      data.status !== undefined,
    {
      message: "At least one field must be provided",
    }
  );

export const addInvestigationNoteSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Note text is required")
    .max(2000, "Note must not exceed 2000 characters"),
});

export const investigationIdSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid investigation ID"),
});