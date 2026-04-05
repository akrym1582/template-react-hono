import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

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
export type LocalLoginInput = z.infer<typeof localLoginSchema>;
export type MsalLoginInput = z.infer<typeof msalLoginSchema>;
