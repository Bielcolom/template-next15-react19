import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { normalizePermissions } from "@/utils/helpers";
import {
  cacheUserPermissions,
  deleteCachedUserPermissions,
  getCurrentPermissions,
} from "./permissionCache";
import { AppError } from "@/errors/AppError";
import { ERROR_CODES } from "@/errors/codes";
import { ERROR_MESSAGES } from "@/errors/messages";
import { encodedKey } from "@/utils/sessionSecret";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const isProduction = process.env.NODE_ENV === "production";

const buildSessionCookieOptions = (expiresAt) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict",
  expires: expiresAt,
  maxAge: SESSION_TTL_SECONDS,
  path: "/",
});

const buildUserIdCookieOptions = (expiresAt) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict",
  expires: expiresAt,
  maxAge: SESSION_TTL_SECONDS,
  path: "/",
});

const buildExpiredCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict",
  expires: new Date(0),
  maxAge: 0,
  path: "/",
});

const getSessionCookieValue = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("session")?.value;
};

const getValidatedSessionState = async () => {
  const session = await getSessionCookieValue();

  if (!session) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED);
  }

  let payload;
  try {
    payload = await decrypt(session);
  } catch {
    throw new AppError(ERROR_CODES.UNAUTHORIZED);
  }

  if (!payload?.userId) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED);
  }

  const currentPermissions = await getCurrentPermissions(payload.userId);

  return {
    payload,
    currentPermissions,
  };
};

async function createSession(user, permissions = []) {
  const userId = user?._id;
  const normalizedPermissions = normalizePermissions(permissions);

  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  const session = await encrypt({ userId, expiresAt, permissions: normalizedPermissions });

  const cookieStore = await cookies();
  cookieStore.set("session", session, buildSessionCookieOptions(expiresAt));
  cookieStore.set("userId", userId, buildUserIdCookieOptions(expiresAt));
  await cacheUserPermissions(userId, normalizedPermissions);

  return cookieStore;
}

async function deleteSession() {
  const cookiesInstance = await cookies();
  const userId = cookiesInstance.get("userId")?.value;
  cookiesInstance.set("userId", "", buildExpiredCookieOptions());
  cookiesInstance.set("session", "", buildExpiredCookieOptions());
  await deleteCachedUserPermissions(userId);
}

async function getCurrentSession() {
  try {
    const { payload, currentPermissions } = await getValidatedSessionState();
    return {
      ...payload,
      permissions: currentPermissions,
    };
  } catch (error) {
    if (error?.code === ERROR_CODES.UNAUTHORIZED) {
      return null;
    }

    throw error;
  }
}

async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

async function decrypt(session = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    throw new AppError(ERROR_CODES.INVALID_SESSION, ERROR_MESSAGES[ERROR_CODES.INVALID_SESSION]);
  }
}

async function checkPermission(session, requiredPermission, userId) {
  let payload;
  try {
    payload = await decrypt(session);
  } catch {
    throw new AppError(ERROR_CODES.UNAUTHORIZED);
  }

  if (!payload?.userId) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED);
  }

  const currentPermissions = await getCurrentPermissions(payload.userId);
  if (payload.userId !== userId || !currentPermissions.includes(requiredPermission)) {
    throw new AppError(ERROR_CODES.FORBIDDEN);
  }

  return true;
}

async function requirePermission(requiredPermissions) {
  const permissionsToCheck = normalizePermissions(requiredPermissions);
  const { payload, currentPermissions } = await getValidatedSessionState();
  const isAuthorized = permissionsToCheck.some((permission) => currentPermissions.includes(permission));

  if (!isAuthorized) {
    throw new AppError(ERROR_CODES.FORBIDDEN);
  }

  return { ...payload, permissions: currentPermissions };
}

export {
  createSession,
  deleteSession,
  getCurrentSession,
  encrypt,
  decrypt,
  checkPermission,
  requirePermission,
};
