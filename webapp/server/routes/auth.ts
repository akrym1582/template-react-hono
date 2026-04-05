import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";

type AuthVariables = {
  Variables: {
    userId: string;
    userEmail: string;
  };
};

const app = new Hono<AuthVariables>();

app.get("/me", authMiddleware, (c) => {
  return c.json({
    userId: c.get("userId"),
    userEmail: c.get("userEmail"),
  });
});

export const authRoute = app;
