import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

async function createSession(userId) {
  // 7 Days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, expiresAt });

  //In future, it doesn't have to do the await
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    expires: expiresAt,
  });
  return cookieStore;
}

async function getUserIdFromSession() {
  const session = cookies().get("session")?.value;

  if (!session) return null;

  const payload = await decrypt(session);
  return payload?.userId || null;
}

async function deleteSession() {
  cookies().delete("session");
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
    console.log("Failed to verify session");
  }
}

export { createSession, deleteSession, getUserIdFromSession, encrypt, decrypt };
