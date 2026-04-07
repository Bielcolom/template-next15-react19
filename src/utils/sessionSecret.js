// This module is intentionally NOT marked server-only so it can be imported
// from both Node.js server code (session.js) and the Edge middleware.
// SESSION_SECRET is only available server-side via process.env, so this
// module will never be accessible in client bundles.
import { ERROR_CODES } from "@/errors/codes";
import { ERROR_MESSAGES } from "@/errors/messages";

const rawKey = process.env.SESSION_SECRET;
if (!rawKey || rawKey.length < 32) {
  throw new Error(ERROR_MESSAGES[ERROR_CODES.CONFIG_INVALID_SESSION_SECRET]);
}

export const encodedKey = new TextEncoder().encode(rawKey);
