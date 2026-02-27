import { NextResponse } from "next/server";
import { ROUTES } from "./utils/urls";
import { normalizePermissions } from "./utils/helpers";
import Negotiator from "negotiator";
import { match } from "@formatjs/intl-localematcher";
import { jwtVerify } from "jose";

const locales = ["es", "en"];
const defaultLocale = "es";
const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET);

// Función para obtener el idioma preferido de la cabecera "Accept-Language"
const getLocale = (request) => {
  const headers = { "accept-language": request.headers.get("accept-language") || "es,en;q=0.5" };
  const languages = new Negotiator({ headers }).languages();
  return match(languages, locales, defaultLocale);
};

const decryptSession = async (session = "") => {
  const { payload } = await jwtVerify(session, encodedKey, {
    algorithms: ["HS256"],
  });
  return payload;
};

export default async function middleware(req) {
  const { pathname } = req.nextUrl;
  const segments = pathname.split("/").filter(Boolean); // Filtra cualquier valor vacío
  const requestLocale = locales.includes(segments[0]) ? segments[0] : null;
  const locale = requestLocale || getLocale(req);
  const pathWithoutLocale = requestLocale
    ? `/${segments.slice(1).join("/")}`.replace(/\/$/, "") || "/"
    : pathname;

  // Verificar si el path ya contiene un locale soportado
  const pathnameHasLocale = Boolean(requestLocale);

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
    const payload = await decryptSession(sessionCookie);
    const permissions = normalizePermissions(payload?.permissions);

    // Validar la expiración de la sesión
    const now = new Date();
    if (new Date(payload.expiresAt) < now) {

      return NextResponse.redirect(new URL(`/${locale}/login`, req.nextUrl));
    }

    // Verificar permisos según la ruta
    if (isPrivateRoute && !permissions.includes("admin_access")) {

      return NextResponse.redirect(new URL(`/${locale}`, req.nextUrl));
    }

    if (isSuperAdminRoute && !permissions.includes("superadmin_access")) {

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
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|.*\\..*).*)",
  ],
};
