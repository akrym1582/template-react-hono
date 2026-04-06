import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { DOWNLOAD_CLEAR_LOADING_COOKIE } from "../../shared/constants/index.js";
import { env } from "./env.js";

export function setDownloadCompletedCookie(c: Context) {
  setCookie(c, DOWNLOAD_CLEAR_LOADING_COOKIE, "1", {
    httpOnly: false,
    secure: env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 60,
  });
}
