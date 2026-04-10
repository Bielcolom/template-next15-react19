import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { AUTH_ACTIONS, evaluateAuthPolicy } from "./middleware/authPolicy";
import {
  INDEX_URL,
  LOGIN_URL,
  getLocalizedPath,
  hasLocale,
  looksLikeLocale,
  stripLocaleFromPath,
} from "./utils/urls";
import { jwtVerify } from "jose";
import { routing } from "./i18n/routing";
import { encodedKey } from "./utils/sessionSecret";
import { logger } from "./utils/logger";

const isProduction = process.env.NODE_ENV === "production";

const buildCsp = () => {
  const scriptSrc = isProduction
    ? "'self' 'unsafe-inline'"
    : "'self' 'unsafe-inline' 'unsafe-eval'";

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
};

const addSecurityHeaders = (response) => {
  response.headers.set("Content-Security-Policy", buildCsp());
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
};
const handleI18nRouting = createMiddleware(routing);

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
  const response = NextResponse.redirect(new URL(getLocalizedPath(LOGIN_URL, locale), req.nextUrl));
  const withCookies = clearCookies ? clearAuthCookies(response) : response;
  return addSecurityHeaders(withCookies);
};

const resolveAuthResponse = (req, locale, policyResult) => {
  if (policyResult.action === AUTH_ACTIONS.ALLOW) {
    return null;
  }

  if (policyResult.action === AUTH_ACTIONS.REDIRECT_HOME) {
    return addSecurityHeaders(
      NextResponse.redirect(new URL(getLocalizedPath(INDEX_URL, locale), req.nextUrl))
    );
  }

  return redirectToLogin(req, locale, policyResult.clearCookies);
};

export default async function middleware(req) {
  const { pathname } = req.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0] || "";
  const requestLocale = hasLocale(firstSegment) ? firstSegment : null;

  if (!requestLocale && looksLikeLocale(firstSegment)) {
    return NextResponse.next();
  }

  const intlResponse = handleI18nRouting(req);
  if (!requestLocale) {
    return intlResponse;
  }

  const locale = requestLocale;
  const pathWithoutLocale = stripLocaleFromPath(pathname);
  const cookies = req.cookies;
  const sessionCookie = cookies.get("session")?.value;

  try {
    if (!sessionCookie) {
      const policyResult = evaluateAuthPolicy({ pathWithoutLocale, payload: null });
      return resolveAuthResponse(req, locale, policyResult) || addSecurityHeaders(intlResponse);
    }

    const payload = await decryptSession(sessionCookie);
    const policyResult = evaluateAuthPolicy({ pathWithoutLocale, payload });
    return resolveAuthResponse(req, locale, policyResult) || addSecurityHeaders(intlResponse);
  } catch (error) {
    logger.error("Middleware Error", error);
    return redirectToLogin(req, locale, true);
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|.*\\..*).*)",
  ],
};
