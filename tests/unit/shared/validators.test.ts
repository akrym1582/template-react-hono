import { describe, it, expect } from "vitest";
import { createUserSchema, updateUserSchema } from "../../../webapp/shared/validators/index.js";

describe("createUserSchema", () => {
  it("validates valid input", () => {
    const result = createUserSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createUserSchema.safeParse({
      name: "",
      email: "test@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = createUserSchema.safeParse({
      name: "Test",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = createUserSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateUserSchema", () => {
  it("validates partial update", () => {
    const result = updateUserSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });

  it("validates empty update", () => {
    const result = updateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects invalid email in update", () => {
    const result = updateUserSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });
});
