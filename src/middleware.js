import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/"];
const PUBLIC_ROUTES = ["/login", "/userRoles"];

export default async function middleware(req) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = PROTECTED_ROUTES.includes(path);
  const isPublicRoute = PUBLIC_ROUTES.includes(path);

  const cookieStore = await cookies();
  const cookie = cookieStore.get("userId")?.value;

  // Redirigir si intenta acceder a rutas protegidas sin sesión válida
  if (isProtectedRoute && !cookie) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Redirigir si intenta acceder a rutas públicas con una sesión activa
  if (isPublicRoute && cookie) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Continuar con la solicitud si no hay redirección
  return NextResponse.next();
}
