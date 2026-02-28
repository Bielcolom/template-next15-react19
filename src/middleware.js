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
import { ERROR_CODES } from "./errors/codes";
import { ERROR_MESSAGES } from "./errors/messages";
import { routing } from "./i18n/routing";

const secretKey = process.env.SESSION_SECRET;
if (!secretKey || secretKey.length < 32) {
  throw new Error(ERROR_MESSAGES[ERROR_CODES.CONFIG_INVALID_SESSION_SECRET]);
}

const encodedKey = new TextEncoder().encode(secretKey);
const isProduction = process.env.NODE_ENV === "production";
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
  return clearCookies ? clearAuthCookies(response) : response;
};

const resolveAuthResponse = (req, locale, policyResult) => {
  if (policyResult.action === AUTH_ACTIONS.ALLOW) {
    return null;
  }

  if (policyResult.action === AUTH_ACTIONS.REDIRECT_HOME) {
    return NextResponse.redirect(new URL(getLocalizedPath(INDEX_URL, locale), req.nextUrl));
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
      return resolveAuthResponse(req, locale, policyResult) || intlResponse;
    }

    const payload = await decryptSession(sessionCookie);
    const policyResult = evaluateAuthPolicy({ pathWithoutLocale, payload });
    return resolveAuthResponse(req, locale, policyResult) || intlResponse;
  } catch (error) {
    console.error("Middleware Error:", error.message);
    return redirectToLogin(req, locale, true);
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|.*\\..*).*)",
  ],
};
