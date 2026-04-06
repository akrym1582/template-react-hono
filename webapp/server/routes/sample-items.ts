import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { serverContainer } from "../container.js";
import { sessionAuthMiddleware, type SessionAuthVariables } from "../middleware/session-auth.js";
import {
  createSampleItemSchema,
  sampleItemSearchSchema,
  updateSampleItemSchema,
} from "../../shared/validators/index.js";
import { SampleItemService } from "../services/sample-item.service.js";
import { createCsvStream } from "../lib/csv.js";
import { setDownloadCompletedCookie } from "../lib/download-cookie.js";
import { AppError } from "../lib/errors.js";

const sampleItemService = serverContainer.get(SampleItemService);

export const sampleItemsRoute = new Hono<SessionAuthVariables>()
  .get("/", sessionAuthMiddleware, zValidator("query", sampleItemSearchSchema), async (c) => {
    const query = c.req.valid("query");
    const page = await sampleItemService.search(query);
    return c.json(page);
  })
  .get("/export", sessionAuthMiddleware, zValidator("query", sampleItemSearchSchema), async (c) => {
    const query = c.req.valid("query");
    const stream = createCsvStream({
      headers: ["Code", "Name", "Category", "Description", "Quantity", "Price", "Active"],
      rows: sampleItemService.streamSearch(query),
      mapRow: (item) => [
        item.code,
        item.name,
        item.category,
        item.description ?? "",
        item.quantity,
        item.price,
        item.isActive ? "Yes" : "No",
      ],
    });

    setDownloadCompletedCookie(c);
    return c.newResponse(stream, 200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="sample-items.csv"',
    });
  })
  .get("/:id", sessionAuthMiddleware, async (c) => {
    const item = await sampleItemService.getById(c.req.param("id"));
    if (!item) {
      throw new AppError("Sample item not found", 404);
    }
    return c.json(item);
  })
  .post("/", sessionAuthMiddleware, zValidator("json", createSampleItemSchema), async (c) => {
    const body = c.req.valid("json");
    const item = await sampleItemService.create(body);
    return c.json(item, 201);
  })
  .put("/:id", sessionAuthMiddleware, zValidator("json", updateSampleItemSchema), async (c) => {
    const item = await sampleItemService.update(c.req.param("id"), c.req.valid("json"));
    if (!item) {
      throw new AppError("Sample item not found", 404);
    }
    return c.json(item);
  })
  .delete("/:id", sessionAuthMiddleware, async (c) => {
    await sampleItemService.delete(c.req.param("id"));
    return c.json({ success: true });
  });
