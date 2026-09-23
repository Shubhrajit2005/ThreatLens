import { z } from "zod";

export const updateIOCSchema = z
  .object({
    confidence: z
      .number()
      .min(0, "Confidence cannot be below 0")
      .max(100, "Confidence cannot exceed 100")
      .optional(),

    tags: z
      .array(z.string().trim().min(1))
      .optional(),

    status: z
      .enum([
        "active",
        "reviewed",
        "false_positive",
        "archived",
      ])
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required for update",
    }
  );