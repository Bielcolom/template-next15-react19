import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { normalizePermissions } from "@/utils/helpers";
import User from "@/models/User";
import UserRole from "@/models/UserRole";

const secretKey = process.env.SESSION_SECRET;
if (!secretKey || secretKey.length < 32) {
  throw new Error("SESSION_SECRET must be defined and at least 32 characters long.");
}

const encodedKey = new TextEncoder().encode(secretKey);
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

const getCurrentPermissionsFromDB = async (userId) => {
  const { connectDB } = await import("@/utils/connectDB");
  await connectDB();

  const user = await User.findById(userId).select("userRoleId").lean();
  if (!user?.userRoleId) {
    throw new Error("UNAUTHORIZED");
  }

  const userRole = await UserRole.findById(user.userRoleId).select("permissions").lean();
  if (!userRole) {
    throw new Error("UNAUTHORIZED");
  }

  return normalizePermissions(userRole.permissions);
};

async function createSession(user, permissions = []) {
  const userId = user?._id;

  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  const session = await encrypt({ userId, expiresAt, permissions });

  const cookieStore = await cookies();
  cookieStore.set("session", session, buildSessionCookieOptions(expiresAt));
  cookieStore.set("userId", userId, buildUserIdCookieOptions(expiresAt));

  return cookieStore;
}

async function deleteSession() {
  const cookiesInstance = await cookies();
  cookiesInstance.set("userId", "", buildExpiredCookieOptions());
  cookiesInstance.set("session", "", buildExpiredCookieOptions());
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
    throw new Error("Invalid or expired session.");
  }
}

async function checkPermission(session, requiredPermission, userId) {
  let payload;
  try {
    payload = await decrypt(session);
  } catch {
    throw new Error("UNAUTHORIZED");
  }

  if (!payload?.userId) {
    throw new Error("UNAUTHORIZED");
  }

  const currentPermissions = await getCurrentPermissionsFromDB(payload.userId);
  if (payload.userId !== userId || !currentPermissions.includes(requiredPermission)) {
    throw new Error("FORBIDDEN");
  }

  return true;
}

async function requirePermission(requiredPermissions) {
  const permissionsToCheck = normalizePermissions(requiredPermissions);
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  let payload;
  try {
    payload = await decrypt(session);
  } catch {
    throw new Error("UNAUTHORIZED");
  }

  if (!payload?.userId) {
    throw new Error("UNAUTHORIZED");
  }

  const currentPermissions = await getCurrentPermissionsFromDB(payload.userId);
  const isAuthorized = permissionsToCheck.some((permission) => currentPermissions.includes(permission));

  if (!isAuthorized) {
    throw new Error("FORBIDDEN");
  }

  return { ...payload, permissions: currentPermissions };
}

export { createSession, deleteSession, encrypt, decrypt, checkPermission, requirePermission };
