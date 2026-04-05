import { describe, it, expect } from "vitest";
import { app } from "../../../../webapp/server/app.js";

describe("Health Route", () => {
  it("GET /api/health returns 200 with status ok", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeDefined();
  });
});
