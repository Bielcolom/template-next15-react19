import { NextResponse } from "next/server";
import { decrypt } from "./app/lib/session";
import { ROUTES } from "./utils/urls";

export default async function middleware(req) {
  const path = req.nextUrl.pathname;

  const cookies = req.cookies;
  const sessionCookie = cookies.get("session")?.value;

  const isPublicRoute = ROUTES.PUBLIC.includes(path);
  const isPrivateRoute = ROUTES.PRIVATE.includes(path);
  const isSuperAdminRoute = ROUTES.SUPERADMIN.includes(path);

  try {
    // Si no hay cookie de sesión
    if (!sessionCookie) {
      if (isPrivateRoute || isSuperAdminRoute) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
      }
      return NextResponse.next();
    }

    // Decodificar la sesión
    const payload = await decrypt(sessionCookie);

    // Validar la expiración de la sesión
    const now = new Date();
    if (new Date(payload.expiresAt) < now) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    // Verificar permisos según la ruta
    if (isPrivateRoute && !payload.permissions.includes("admin_access")) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }

    if (isSuperAdminRoute && !payload.permissions.includes("superadmin_access")) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }

    // Redirigir si intenta acceder a rutas públicas con sesión activa
    if (isPublicRoute) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }

    // Continuar si todas las verificaciones pasan
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware Error:", error.message);

    // Redirigir si hay un error en la sesión
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
}
