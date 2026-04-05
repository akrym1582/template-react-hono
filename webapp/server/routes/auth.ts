import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";

type AuthVariables = {
  Variables: {
    userId: string;
    userEmail: string;
  };
};

export const authRoute = new Hono<AuthVariables>().get("/me", authMiddleware, (c) => {
  return c.json({
    userId: c.get("userId"),
    userEmail: c.get("userEmail"),
  });
});
