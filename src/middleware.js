import { NextResponse } from "next/server";
import { AUTH_ACTIONS, evaluateAuthPolicy } from "./middleware/authPolicy";
import Negotiator from "negotiator";
import { match } from "@formatjs/intl-localematcher";
import { jwtVerify } from "jose";

const locales = ["es", "en"];
const defaultLocale = "es";
const secretKey = process.env.SESSION_SECRET;
if (!secretKey || secretKey.length < 32) {
  throw new Error("SESSION_SECRET must be defined and at least 32 characters long.");
}
const encodedKey = new TextEncoder().encode(secretKey);
const isProduction = process.env.NODE_ENV === "production";

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

const clearAuthCookies = (response) => {
  const expiredCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  };

  response.cookies.set("session", "", expiredCookieOptions);
  response.cookies.set("userId", "", expiredCookieOptions);
  return response;
};

const redirectToLogin = (req, locale, clearCookies = false) => {
  const response = NextResponse.redirect(new URL(`/${locale}/login`, req.nextUrl));
  return clearCookies ? clearAuthCookies(response) : response;
};

const resolveAuthResponse = (req, locale, policyResult) => {
  if (policyResult.action === AUTH_ACTIONS.ALLOW) {
    return NextResponse.next();
  }

  if (policyResult.action === AUTH_ACTIONS.REDIRECT_HOME) {
    return NextResponse.redirect(new URL(`/${locale}`, req.nextUrl));
  }

  return redirectToLogin(req, locale, policyResult.clearCookies);
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

  try {
    if (!sessionCookie) {
      const policyResult = evaluateAuthPolicy({ pathWithoutLocale, payload: null });
      return resolveAuthResponse(req, locale, policyResult);
    }

    const payload = await decryptSession(sessionCookie);
    const policyResult = evaluateAuthPolicy({ pathWithoutLocale, payload });
    return resolveAuthResponse(req, locale, policyResult);
  } catch (error) {
    console.error("Middleware Error:", error.message);

    return redirectToLogin(req, locale, true);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|.*\\..*).*)",
  ],
};
