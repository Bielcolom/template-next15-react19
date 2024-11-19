import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decrypt } from "./app/lib/session";

const PROTECTED_ROUTES = ["/"];
const PUBLIC_ROUTES = ["/login"];

export default async function middleware(req) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = PROTECTED_ROUTES.includes(path);
  const isPublicRoute = PUBLIC_ROUTES.includes(path);

  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;

  let session = null;
  if (cookie) {
    session = await decrypt(cookie);
  }

  // Redirigir si intenta acceder a rutas protegidas sin sesión válida
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Redirigir si intenta acceder a rutas públicas con una sesión activa
  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Continuar con la solicitud si no hay redirección
  return NextResponse.next();
}
