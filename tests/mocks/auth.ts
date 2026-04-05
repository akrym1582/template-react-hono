import { vi } from "vitest";

export const mockJwtVerify = vi.fn();

vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn().mockReturnValue({}),
  jwtVerify: mockJwtVerify,
}));
