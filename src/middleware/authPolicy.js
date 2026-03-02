import { INDEX_URL, ROUTES } from "../utils/urls";

export const AUTH_ACTIONS = {
  ALLOW: "allow",
  REDIRECT_LOGIN: "redirect_login",
  REDIRECT_HOME: "redirect_home",
};

const normalizePath = (path = INDEX_URL) => {
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, "");
  return withoutTrailingSlash || INDEX_URL;
};

const matchesExactRoute = (path, route) => normalizePath(path) === normalizePath(route);

const matchesProtectedRoute = (path, route) => {
  const normalizedPath = normalizePath(path);
  const normalizedRoute = normalizePath(route);

  if (normalizedRoute === INDEX_URL) {
    return normalizedPath === INDEX_URL;
  }

  return normalizedPath === normalizedRoute || normalizedPath.startsWith(`${normalizedRoute}/`);
};

export const evaluateAuthPolicy = ({ pathWithoutLocale, payload }) => {
  const isPublicRoute = ROUTES.PUBLIC.some((route) => matchesExactRoute(pathWithoutLocale, route));
  const isPrivateRoute = ROUTES.PRIVATE.some((route) => matchesProtectedRoute(pathWithoutLocale, route));
  const isSuperAdminRoute = ROUTES.SUPERADMIN.some((route) => matchesProtectedRoute(pathWithoutLocale, route));
  const isProtectedRoute = isPrivateRoute || isSuperAdminRoute;

  if (!payload) {
    if (isProtectedRoute) {
      return { action: AUTH_ACTIONS.REDIRECT_LOGIN, clearCookies: false };
    }
    return { action: AUTH_ACTIONS.ALLOW, clearCookies: false };
  }

  const expiresAtMs = new Date(payload.expiresAt).getTime();
  if (!Number.isFinite(expiresAtMs) || expiresAtMs < Date.now()) {
    return { action: AUTH_ACTIONS.REDIRECT_LOGIN, clearCookies: true };
  }

  if (isPublicRoute) {
    return { action: AUTH_ACTIONS.REDIRECT_HOME, clearCookies: false };
  }

  return { action: AUTH_ACTIONS.ALLOW, clearCookies: false };
};
