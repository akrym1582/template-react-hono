import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

export const sampleItemSearchSchema = z.object({
  keyword: z.string().trim().max(100).optional().default(""),
  category: z.string().trim().max(100).optional().default(""),
  cursor: z.string().trim().regex(/^\d+$/).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const createSampleItemSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(40),
  name: z.string().trim().min(1, "Name is required").max(100),
  category: z.string().trim().min(1, "Category is required").max(100),
  description: z.string().trim().max(500).optional().default(""),
  quantity: z.number().int().min(0).max(999999),
  price: z.number().min(0).max(99999999),
  isActive: z.boolean(),
});

export const updateSampleItemSchema = createSampleItemSchema;

export const localLoginSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  password: z.string().min(1, "Password is required"),
});

export const msalLoginSchema = z
  .object({
    idToken: z.string().min(1).optional(),
    accessToken: z.string().min(1).optional(),
  })
  .refine((value) => Boolean(value.idToken || value.accessToken), {
    message: "Either idToken or accessToken is required",
    path: ["idToken"],
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type SampleItemSearchInput = z.infer<typeof sampleItemSearchSchema>;
export type CreateSampleItemInput = z.infer<typeof createSampleItemSchema>;
export type UpdateSampleItemInput = z.infer<typeof updateSampleItemSchema>;
export type LocalLoginInput = z.infer<typeof localLoginSchema>;
export type MsalLoginInput = z.infer<typeof msalLoginSchema>;
