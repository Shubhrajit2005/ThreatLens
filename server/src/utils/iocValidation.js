import { z } from "zod";

const iocTypes = [
  "ipv4",
  "ipv6",
  "domain",
  "url",
  "md5",
  "sha1",
  "sha256",
];

export const createIOCSchema = z.object({
  value: z
    .string()
    .trim()
    .min(1, "IOC value is required"),

  type: z.enum(iocTypes),

  confidence: z
    .number()
    .min(0, "Confidence cannot be below 0")
    .max(100, "Confidence cannot exceed 100")
    .optional(),

  tags: z
    .array(z.string().trim().min(1))
    .optional(),
});