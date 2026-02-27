import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);


async function createSession(user, permissions = []) {
  const userId = user?._id;

  // 7 Days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, expiresAt, permissions: permissions });

  //In future, it doesn't have to do the await
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    expires: expiresAt,
    maxAge: 7 * 24 * 60 * 60,
  });
  cookieStore.set("userId", userId, {
    secure: true,     // Solo en HTTPS
    sameSite: "Strict",
    expires: expiresAt,
  });

  return cookieStore;
}

async function deleteSession() {
  const cookiesInstance = await cookies();
  cookiesInstance.delete("userId");
  cookiesInstance.delete("session");
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
  // Decodificar el JWT
  const payload = await decrypt(session);

  if (!payload || payload.userId !== userId || !payload.permissions || !payload.permissions.includes(requiredPermission)) {
    throw new Error("No tienes los permisos necesarios para realizar esta acción.");
  }

  return true;
}

export { createSession, deleteSession, encrypt, decrypt, checkPermission };
