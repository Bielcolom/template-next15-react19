import { NextResponse } from "next/server";
import { decrypt } from "./app/lib/session";
import { ROUTES } from "./utils/urls";
import Negotiator from "negotiator";
import { match } from "@formatjs/intl-localematcher";

const locales = ["es", "en"];
const defaultLocale = "es";

// Función para obtener el idioma preferido de la cabecera "Accept-Language"
const getLocale = (request) => {
  const headers = { "accept-language": request.headers.get("accept-language") || "es,en;q=0.5" };
  const languages = new Negotiator({ headers }).languages();
  return match(languages, locales, defaultLocale);
};

export default async function middleware(req) {
  const { pathname } = req.nextUrl;
  const locale = getLocale(req);
  const segments = pathname.split("/").filter(Boolean); // Filtra cualquier valor vacío
  const pathWithoutLocale = "/" + segments.slice(1).join("/"); // Elimina el primer segmento y agrega un "/" al principio

  // Verificar si el path ya contiene un locale soportado
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Si no contiene un idioma válido en la URL, redirigir al idioma predeterminado
  if (!pathnameHasLocale) {
    req.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(req.nextUrl);
  }

  // Manejo de autenticación y permisos
  const cookies = req.cookies;
  const sessionCookie = cookies.get("session")?.value;

  const isPublicRoute = ROUTES.PUBLIC.includes(pathWithoutLocale);
  const isPrivateRoute = ROUTES.PRIVATE.includes(pathWithoutLocale);
  const isSuperAdminRoute = ROUTES.SUPERADMIN.includes(pathWithoutLocale);

  try {
    // Verificar si no hay una sesión activa
    if (!sessionCookie) {
      // Redirigir si es una ruta privada o de superadministrador sin sesión
      if (isPrivateRoute || isSuperAdminRoute) {
        return NextResponse.redirect(new URL(`/${locale}/login`, req.nextUrl));
      }
      return NextResponse.next();
    }

    // Decodificar la sesión
    const payload = await decrypt(sessionCookie);

    // Validar la expiración de la sesión
    const now = new Date();
    if (new Date(payload.expiresAt) < now) {

      return NextResponse.redirect(new URL(`/${locale}/login`, req.nextUrl));
    }

    // Verificar permisos según la ruta
    if (isPrivateRoute && !payload.permissions.includes("admin_access")) {

      return NextResponse.redirect(new URL(`/${locale}`, req.nextUrl));
    }

    if (isSuperAdminRoute && !payload.permissions.includes("superadmin_access")) {

      return NextResponse.redirect(new URL(`/${locale}`, req.nextUrl));
    }

    // Redirigir si intenta acceder a rutas públicas con sesión activa
    if (isPublicRoute) {

      return NextResponse.redirect(new URL(`/${locale}`, req.nextUrl));
    }

    // Continuar si todas las verificaciones pasan
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware Error:", error.message);

    // Redirigir si hay un error en la sesión
    return NextResponse.redirect(new URL(`/${locale}/login`, req.nextUrl));
  }
}

export const config = {
  matcher: [
    "/((?!_next).*)", // Ignora rutas internas de Next.js
  ],
};
