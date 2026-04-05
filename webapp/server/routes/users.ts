import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "../middleware/auth.js";
import { UserService } from "../services/user.service.js";
import {
  createUserSchema,
  updateUserSchema,
} from "../../shared/validators/index.js";

type AuthVariables = {
  Variables: {
    userId: string;
    userEmail: string;
  };
};

const userService = new UserService();

export const usersRoute = new Hono<AuthVariables>()
  .get("/", authMiddleware, async (c) => {
    const users = await userService.getAll();
    return c.json(users);
  })
  .get("/:id", authMiddleware, async (c) => {
    const id = c.req.param("id");
    const user = await userService.getById(id);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json(user);
  })
  .post("/", authMiddleware, zValidator("json", createUserSchema), async (c) => {
    const body = c.req.valid("json");
    const user = await userService.create(body);
    return c.json(user, 201);
  })
  .put("/:id", authMiddleware, zValidator("json", updateUserSchema), async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const user = await userService.update(id, body);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json(user);
  })
  .delete("/:id", authMiddleware, async (c) => {
    const id = c.req.param("id");
    await userService.delete(id);
    return c.json({ success: true });
  });
